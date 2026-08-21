#!/usr/bin/env python3
"""Build the quarantined Thailand ADM3 identity registry from DOPA evidence.

Both source files are supplied outside the repository. The generated registry
contains factual identities only and remains blocked from publication because
explicit redistribution terms have not been established.
"""

from __future__ import annotations

import hashlib
import html.parser
import json
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
IDENTITY_SHA256 = "5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9"
FRESHNESS_SHA256 = "cc8902fd622cf4733b244942849854e549b07f66d72e352579dcca3aeeb443d4"
IDENTITY_REFERENCE = "DOPA-CCAATT-2023-09-01"
FRESHNESS_REFERENCE = "DOPA-POPULATION-ADM3-2026-03"
IDENTITY_URL = "https://stat.bora.dopa.go.th/dload/ccaatt.xlsx"
FRESHNESS_URL = "https://stat.bora.dopa.go.th/new_stat/file/69/3_6903.xls"
FRESHNESS_CATALOG_URL = (
    "https://stat.bora.dopa.go.th/new_stat/webPage/"
    "statByMooBan.php?month=03&year=69"
)
FRESHNESS_PERIOD = "6903"
EXPECTED_TAMBON = 7256
EXPECTED_KHWAENG = 180


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized(value: object) -> str:
    return unicodedata.normalize("NFC", str(value or "").strip())


def cell_column(reference: str) -> str:
    return "".join(character for character in reference if character.isalpha())


def read_xlsx_rows(path: Path) -> list[dict[str, str]]:
    namespace = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    with ZipFile(path) as archive:
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        shared = [
            "".join(node.text or "" for node in item.iter(f"{namespace}t"))
            for item in shared_root.findall(f"{namespace}si")
        ]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))

    rows: list[dict[str, str]] = []
    for row in sheet.findall(f".//{namespace}row"):
        values: dict[str, str] = {}
        for cell in row.findall(f"{namespace}c"):
            value_node = cell.find(f"{namespace}v")
            if value_node is None:
                continue
            value = value_node.text or ""
            if cell.get("t") == "s":
                value = shared[int(value)]
            values[cell_column(cell.get("r", ""))] = value
        rows.append(values)
    return rows


class EvidenceTableParser(html.parser.HTMLParser):
    """Read only the identity columns from DOPA's HTML-formatted XLS file."""

    def __init__(self) -> None:
        super().__init__()
        self.in_cell = False
        self.cell = ""
        self.row: list[str] = []
        self.rows: list[list[str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        del attrs
        if tag == "tr":
            self.row = []
        elif tag == "td":
            self.in_cell = True
            self.cell = ""

    def handle_data(self, data: str) -> None:
        if self.in_cell:
            self.cell += data

    def handle_endtag(self, tag: str) -> None:
        if tag == "td":
            self.in_cell = False
            self.row.append(normalized(self.cell))
        elif tag == "tr" and len(self.row) >= 7:
            self.rows.append(self.row[:7])


def read_freshness_identities(path: Path) -> dict[str, dict[str, str]]:
    parser = EvidenceTableParser()
    parser.feed(path.read_text(encoding="utf-8"))
    identities: dict[str, dict[str, str]] = {}
    for row in parser.rows[1:]:
        represented_period = row[0].lstrip("\ufeff")
        if represented_period != FRESHNESS_PERIOD:
            raise SystemExit(
                f"freshness evidence period must be {FRESHNESS_PERIOD}, "
                f"found {represented_period or 'empty'}"
            )
        province_code, district_code, code = row[1], row[3], row[5]
        if not (province_code.isdigit() and district_code.isdigit() and code.isdigit()):
            continue
        # The fourth column is a registration-office code, not necessarily the
        # administrative parent: municipal offices can repeat the same ADM3
        # identity. Parentage is derived from the authoritative CCAATT code.
        identity = {
            "provinceCode": province_code.zfill(2),
            "nameTh": row[6],
        }
        existing = identities.get(code.zfill(6))
        if existing is not None and existing != identity:
            raise SystemExit(f"{code}: conflicting identities in freshness evidence")
        identities[code.zfill(6)] = identity
    return identities


def build(identity_path: Path, freshness_path: Path) -> None:
    failures: list[str] = []
    if sha256(identity_path) != IDENTITY_SHA256:
        failures.append("CCAATT identity checksum does not match the reviewed snapshot")
    if sha256(freshness_path) != FRESHNESS_SHA256:
        failures.append("ADM3 freshness checksum does not match the reviewed snapshot")

    district_payload = json.loads(
        (ROOT / "data/research/thailand-district-evidence.json").read_text(
            encoding="utf-8"
        )
    )
    districts = {record["code"]: record for record in district_payload["records"]}
    if len(districts) != 928:
        failures.append(f"expected 928 quarantined parent districts, found {len(districts)}")

    freshness = read_freshness_identities(freshness_path)
    source_records: list[dict[str, str]] = []
    inactive_records: list[dict[str, str]] = []
    for row in read_xlsx_rows(identity_path):
        raw_code = row.get("A", "")
        if not raw_code.isdigit():
            continue
        code = raw_code.zfill(8)
        if not (code[2:4] != "00" and code[4:6] != "00" and code[6:] == "00"):
            continue
        source = {
            "code": code[:6],
            "nameTh": normalized(row.get("B")).removesuffix("*"),
            "nameEn": normalized(row.get("C")),
            "disposedAt": normalized(row.get("D")),
        }
        if row.get("D", "0") in {"", "0"}:
            source_records.append(source)
        else:
            inactive_records.append(source)

    records: list[dict[str, object]] = []
    for source in source_records:
        parent_code = source["code"][:4]
        parent = districts.get(parent_code)
        if parent is None:
            failures.append(f"{source['code']}: unknown parent district {parent_code}")
            continue
        current = freshness.get(source["code"])
        if current is None:
            failures.append(f"{source['code']}: absent from 2026-03 freshness evidence")
            continue
        if current["provinceCode"] != source["code"][:2]:
            failures.append(f"{source['code']}: freshness parent province mismatch")
        is_bangkok = source["code"].startswith("10")
        expected_fresh_name = (
            f"แขวง{source['nameTh']}" if is_bangkok else f"ตำบล{source['nameTh']}"
        )
        if current["nameTh"] != expected_fresh_name:
            failures.append(f"{source['code']}: Thai name differs in freshness evidence")
        records.append(
            {
                "code": source["code"],
                "nameTh": expected_fresh_name if is_bangkok else source["nameTh"],
                "nameEn": source["nameEn"],
                "administrativeType": "bangkok_khwaeng" if is_bangkok else "tambon",
                "parentDistrictCode": parent["code"],
                "parentDistrictNameTh": parent["nameTh"],
                "parentDistrictNameEn": parent["nameEn"],
                "parentProvinceCode": parent["parentProvinceCode"],
                "parentProvinceNameTh": parent["parentProvinceNameTh"],
                "parentProvinceNameEn": parent["parentProvinceNameEn"],
                "region": parent["region"],
                "sourceReferences": [IDENTITY_REFERENCE, FRESHNESS_REFERENCE],
                "verificationStatus": "verified_identity",
                "rightsStatus": "pending_explicit_redistribution_terms",
                "freshnessStatus": "cross_checked_2026_03",
                "englishNameStatus": "verified_authoritative",
                "lifecycleStatus": "active",
                "boundaryStatus": "pending",
                "publicationEligibility": "blocked",
                "notes": ["research_only", "redistribution_rights_pending"],
                "conflicts": [],
            }
        )

    codes = [record["code"] for record in records]
    normalized_names = [
        (record["parentDistrictCode"], normalized(record["nameTh"]).casefold())
        for record in records
    ]
    province_counts = Counter(record["parentProvinceCode"] for record in records)
    district_counts = Counter(record["parentDistrictCode"] for record in records)
    khwaeng_count = sum(
        record["administrativeType"] == "bangkok_khwaeng" for record in records
    )
    tambon_count = sum(record["administrativeType"] == "tambon" for record in records)
    source_codes = set(codes)
    current_codes = set(freshness)
    missing = sorted(source_codes - current_codes)
    extra = sorted(current_codes - source_codes)

    checks = {
        "totalRecords": len(records) == EXPECTED_TAMBON + EXPECTED_KHWAENG,
        "tambon": tambon_count == EXPECTED_TAMBON,
        "bangkokKhwaeng": khwaeng_count == EXPECTED_KHWAENG,
        "provinceCoverage": len(province_counts) == 77,
        "districtCoverage": len(district_counts) == 928 and set(district_counts) == set(districts),
        "uniqueCodes": len(codes) == len(set(codes)),
        "uniqueThaiNamesWithinParent": len(normalized_names) == len(set(normalized_names)),
        "englishNamesPresent": all(record["nameEn"] for record in records),
        "freshnessExactCoverage": not missing and not extra,
        "bangkokClassification": all(
            (record["parentProvinceCode"] == "TH-10")
            == (record["administrativeType"] == "bangkok_khwaeng")
            for record in records
        ),
        "boundariesPending": all(record["boundaryStatus"] == "pending" for record in records),
        "publicationBlocked": all(
            record["publicationEligibility"] == "blocked" for record in records
        ),
        "rightsPending": all(
            record["rightsStatus"] == "pending_explicit_redistribution_terms"
            for record in records
        ),
    }
    failures.extend(name for name, passed in checks.items() if not passed)
    if failures:
        raise SystemExit("\n".join(failures))

    records.sort(key=lambda record: str(record["code"]))
    output = {
        "status": "research_evidence_only",
        "publicationEligibility": "blocked",
        "boundaryStatus": "pending",
        "records": records,
    }
    output_text = json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n"
    output_path = ROOT / "data/research/thailand-subdistrict-evidence.json"
    output_path.write_text(output_text, encoding="utf-8")

    parent_counts = {
        parent: district_counts[parent] for parent in sorted(district_counts)
    }
    manifest = {
        "status": "research_evidence_only",
        "publicationEligibility": "blocked",
        "sourceRegister": [
            {
                "reference": IDENTITY_REFERENCE,
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": IDENTITY_URL,
                "retrievedAt": "2026-08-20",
                "representedAt": "2023-09-01",
                "evidenceLocator": "ccaatt_25660901 active CCAATT00 rows; code, Thai name, English name, disposal date",
                "sha256": IDENTITY_SHA256,
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
            {
                "reference": FRESHNESS_REFERENCE,
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": FRESHNESS_URL,
                "catalogUrl": FRESHNESS_CATALOG_URL,
                "retrievedAt": "2026-08-20",
                "representedAt": "2026-03",
                "artifactPathParameters": {
                    "BuddhistYearTwoDigit": "69",
                    "administrativeLevel": "3",
                    "yearMonth": FRESHNESS_PERIOD,
                },
                "evidenceLocator": "artifact /69/3_6903.xls; every data row has year-month field 6903; columns province code, registration-office code, subdistrict code and Thai name",
                "sha256": FRESHNESS_SHA256,
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
        ],
        "authoritativeTotals": {
            "tambon": tambon_count,
            "bangkokKhwaeng": khwaeng_count,
            "combinedAdministrativeLevel3": len(records),
        },
        "provinceCounts": {
            province: province_counts[province] for province in sorted(province_counts)
        },
        "parentDistrictCounts": parent_counts,
        "identityVerifiedRecords": len(records),
        "rightsPendingRecords": len(records),
        "englishNameGaps": 0,
        "boundaryPendingRecords": len(records),
        "inactiveSourceRecordsExcluded": len(inactive_records),
        "missingRecords": missing,
        "extraRecords": extra,
        "duplicateRecords": 0,
        "orphanRecords": 0,
        "conflictingRecords": 0,
        "registrySha256": hashlib.sha256(output_text.encode()).hexdigest(),
        "checks": checks,
        "knownSourceVariance": [
            "CCAATT identity names omit administrative prefixes; the 2026-03 cross-check uses ตำบล/แขวง prefixes. Registry retains official แขวง for Bangkok and canonical CCAATT names for provincial tambon."
        ],
    }
    manifest_path = ROOT / "data/research/thailand-subdistrict-evidence.manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    coverage_rows = []
    for parent_code, count in parent_counts.items():
        parent = districts[parent_code]
        unit = "แขวง" if parent["parentProvinceCode"] == "TH-10" else "ตำบล"
        coverage_rows.append(
            f"| {parent['parentProvinceCode']} | {parent_code} | {parent['nameTh']} | {unit} | {count} | {count} | {count} | {count} | 0 | 0 | 0 | pending | blocked |"
        )
    coverage = """# Thailand Nationwide Subdistrict Coverage Matrix

This is a quarantined research/evidence baseline. Redistribution rights are unresolved, boundaries are absent, and every identity is blocked from publication.

- Current cross-checked total: **7,256 tambon plus 180 Bangkok khwaeng = 7,436 ADM3 identities**
- Identity source represented date: **2023-09-01**
- Freshness cross-check represented month: **2026-03**
- Province coverage: **77/77**
- Parent district coverage: **928/928**
- Missing / extra / duplicate / orphan / conflicting records: **0 / 0 / 0 / 0 / 0**
- Rights-pending and boundary-pending records: **7,436 / 7,436**

| Province | Parent district | Parent Thai name | Unit | Expected | Research | Identity verified | Rights pending | English gaps | Parent mismatch | Lifecycle conflict | Boundary | Publication |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
""" + "\n".join(coverage_rows) + "\n"
    (ROOT / "docs/geography/Thailand_Subdistrict_Coverage_Matrix.md").write_text(
        coverage, encoding="utf-8"
    )

    print(
        f"Built {len(records)} blocked ADM3 identities: "
        f"{tambon_count} tambon and {khwaeng_count} Bangkok khwaeng"
    )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: build-thailand-subdistrict-registry.py CCAATT_XLSX ADM3_XLS")
    build(Path(sys.argv[1]), Path(sys.argv[2]))
