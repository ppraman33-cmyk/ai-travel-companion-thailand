#!/usr/bin/env python3
"""Build the research-only Thailand ADM2 identity registry from DOPA CCAATT.

The source workbook is intentionally supplied from outside the repository because
its redistribution terms have not been confirmed. Outputs remain publication
blocked and contain no boundary geometry.
"""

from __future__ import annotations

import hashlib
import json
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA256 = "5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9"
COUNT_EVIDENCE_SHA256 = "a7af70988cdcfbe9c72dee224f7ac382cffc135942d6be82d8c77c834658d6d4"
SOURCE_REFERENCE = "DOPA-CCAATT-2023-09-01"
SOURCE_URL = "https://stat.bora.dopa.go.th/dload/ccaatt.xlsx"
COUNT_SOURCE_URL = (
    "https://www.bora.dopa.go.th/wp-content/uploads/2026/02/tabdb_09022569.pdf"
)
EXPECTED_PROVINCIAL_DISTRICTS = 878
EXPECTED_BANGKOK_DISTRICTS = 50


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


def build(source_path: Path, count_evidence_path: Path) -> None:
    failures: list[str] = []
    if sha256(source_path) != SOURCE_SHA256:
        failures.append("CCAATT source checksum does not match the reviewed snapshot")
    if sha256(count_evidence_path) != COUNT_EVIDENCE_SHA256:
        failures.append("current-count evidence checksum does not match the reviewed PDF")

    province_geojson = json.loads(
        (ROOT / "data/geography/thailand-provinces.geojson").read_text(encoding="utf-8")
    )
    province_registry = {
        feature["properties"]["code"].removeprefix("TH-"): feature["properties"]
        for feature in province_geojson["features"]
    }
    if len(province_registry) != 77:
        failures.append(f"expected 77 parent provinces, found {len(province_registry)}")

    source_provinces: dict[str, dict[str, str]] = {}
    source_districts: list[dict[str, str]] = []
    for row in read_xlsx_rows(source_path):
        raw_code = row.get("A", "")
        if not raw_code.isdigit():
            continue
        code = raw_code.zfill(8)
        active = row.get("D", "0") in {"", "0"}
        if not active:
            continue
        if code[2:] == "000000":
            source_provinces[code[:2]] = {
                "nameTh": normalized(row.get("B")),
                "nameEn": normalized(row.get("C")),
            }
        elif code[2:4] != "00" and code[4:] == "0000":
            source_districts.append(
                {
                    "code": code[:4],
                    "nameTh": normalized(row.get("B")),
                    "nameEn": normalized(row.get("C")),
                }
            )

    records: list[dict[str, object]] = []
    for source in source_districts:
        province_number = source["code"][:2]
        parent = province_registry.get(province_number)
        if parent is None:
            failures.append(f"{source['code']}: unknown parent province {province_number}")
            continue
        source_parent = source_provinces.get(province_number)
        if source_parent is None:
            failures.append(f"{source['code']}: missing DOPA parent province row")
            continue
        if source_parent["nameTh"] != parent["nameTh"]:
            failures.append(f"{source['code']}: Thai parent name mismatch")
        records.append(
            {
                "code": source["code"],
                "nameTh": source["nameTh"],
                "nameEn": source["nameEn"],
                "administrativeType": (
                    "bangkok_district" if province_number == "10" else "district"
                ),
                "parentProvinceCode": parent["code"],
                "parentProvinceNameTh": parent["nameTh"],
                "parentProvinceNameEn": parent["nameEn"],
                "region": parent["region"],
                "sourceReference": SOURCE_REFERENCE,
                "verificationStatus": "verified_identity",
                "evidenceStatus": "verified_identity_rights_pending",
                "englishNameStatus": "verified_authoritative",
                "boundaryStatus": "pending",
                "publicationEligibility": "blocked",
                "notes": ["research_only", "redistribution_rights_pending"],
                "conflicts": [],
            }
        )

    codes = [record["code"] for record in records]
    normalized_names = [
        (record["parentProvinceCode"], normalized(record["nameTh"]).casefold())
        for record in records
    ]
    province_counts = Counter(record["parentProvinceCode"] for record in records)
    bangkok_count = sum(
        record["administrativeType"] == "bangkok_district" for record in records
    )
    district_count = sum(record["administrativeType"] == "district" for record in records)

    checks = {
        "totalRecords": len(records) == 928,
        "provincialDistricts": district_count == EXPECTED_PROVINCIAL_DISTRICTS,
        "bangkokDistricts": bangkok_count == EXPECTED_BANGKOK_DISTRICTS,
        "provinceCoverage": len(province_counts) == 77
        and set(province_counts) == {properties["code"] for properties in province_registry.values()},
        "uniqueCodes": len(codes) == len(set(codes)),
        "uniqueThaiNamesWithinProvince": len(normalized_names)
        == len(set(normalized_names)),
        "englishNamesPresent": all(record["nameEn"] for record in records),
        "bangkokClassification": all(
            (record["parentProvinceCode"] == "TH-10")
            == (record["administrativeType"] == "bangkok_district")
            for record in records
        ),
        "boundariesPending": all(record["boundaryStatus"] == "pending" for record in records),
        "publicationBlocked": all(
            record["publicationEligibility"] == "blocked" for record in records
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
    output_path = ROOT / "data/research/thailand-district-evidence.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(output_text, encoding="utf-8")

    manifest = {
        "status": "research_evidence_only",
        "publicationEligibility": "blocked",
        "sourceRegister": [
            {
                "reference": SOURCE_REFERENCE,
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": SOURCE_URL,
                "retrievedAt": "2026-08-15",
                "representedAt": "2023-09-01",
                "evidenceLocator": "ccaatt_25660901 rows where CCAA0000 is active; columns code, Thai name, English name, disposal date",
                "sha256": SOURCE_SHA256,
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
            {
                "reference": "DOPA-ADMIN-COUNT-2026-02-09",
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": COUNT_SOURCE_URL,
                "retrievedAt": "2026-08-15",
                "representedAt": "2026-02-09",
                "evidenceLocator": "page 1 rows: district registration offices 878; Bangkok districts 50; regional administration summary",
                "sha256": COUNT_EVIDENCE_SHA256,
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
        ],
        "authoritativeTotals": {
            "provincialDistricts": district_count,
            "bangkokDistricts": bangkok_count,
            "combinedAdministrativeLevel2": len(records),
        },
        "provinceCounts": {
            parent["code"]: province_counts[parent["code"]]
            for _, parent in sorted(province_registry.items())
        },
        "identityVerifiedRecords": len(records),
        "evidencePendingRecords": len(records),
        "englishNameGaps": 0,
        "boundaryPendingRecords": len(records),
        "conflictingRecords": 0,
        "registrySha256": hashlib.sha256(output_text.encode()).hexdigest(),
        "checks": checks,
        "knownSourceVariance": [
            "DOPA spells the Phang Nga province English label as Phang-nga; the approved project province registry retains Phang Nga. Codes and Thai names match."
        ],
    }
    manifest_path = ROOT / "data/research/thailand-district-evidence.manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    coverage_rows = []
    for province_number, parent in sorted(province_registry.items()):
        count = province_counts[parent["code"]]
        unit = "เขต" if province_number == "10" else "อำเภอ"
        coverage_rows.append(
            f"| {parent['code']} | {parent['nameEn']} | {parent['nameTh']} | {parent['region']} | {unit} | {count} | {count} | {count} | {count} | pending | none |"
        )
    coverage = """# Thailand Nationwide District Coverage Matrix

This matrix is a research/evidence baseline. Redistribution rights are unresolved, every boundary is pending, and every record is blocked from publication.

- Current authoritative total: **878 districts plus 50 Bangkok districts = 928 ADM2 identities**
- Identity source represented date: **2023-09-01**
- Current total evidence date: **2026-02-09**
- Verified identity records: **928**
- Evidence/rights pending records: **928**
- Boundary pending records: **928**
- English-name gaps: **0**
- Conflicting district records: **0**

| Province code | Province English | Province Thai | Project region | Unit | Authoritative count | Recorded | Identity verified | Evidence/rights pending | Boundary | Conflicts/gaps |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
""" + "\n".join(coverage_rows) + "\n"
    (ROOT / "docs/geography/Thailand_District_Coverage_Matrix.md").write_text(
        coverage, encoding="utf-8"
    )
    print(json.dumps(manifest["authoritativeTotals"], ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(
            "usage: build-thailand-district-registry.py CCAATT.xlsx current-count.pdf"
        )
    build(Path(sys.argv[1]), Path(sys.argv[2]))
