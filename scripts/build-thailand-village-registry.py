#!/usr/bin/env python3
"""Build the quarantined nationwide village identity research registry.

The three source inputs are supplied outside the repository. DOPA's monthly
HTML-formatted XLS files contain demographic columns; this builder deliberately
reads only the nine leading administrative identity columns and emits no
population, household, or person-level values.
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
CCAATT_SHA256 = "5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9"
MARCH_SET_SHA256 = "527120451009c18732c3f187a5dc0b1a94fdc4c60b25051ac7f155e6d53c066f"
JULY_SET_SHA256 = "1818ba3de7a0f2a7a0fe3e17dfbe43a095c8227a7aaff130e61b68bb57029194"
MARCH_CATALOG_SHA256 = "f010f0dd765c113c3324747b04dbd3eec786638b46d53769fbd6c530cba849ea"
JULY_CATALOG_SHA256 = "54071e5c890433b73f4ca1646ad48ea26c062a14f4c8df051528fd7677868eae"
EXPECTED_VILLAGES = 75_652
EXPECTED_PROVINCES = 76
EXPECTED_DISTRICTS = 878
EXPECTED_TAMBONS = 7_256

TD = re.compile(r"<td(?: [^>]*)?>(.*?)</td>", re.IGNORECASE | re.DOTALL)
TR = re.compile(r"<tr>(.*?)</tr>", re.IGNORECASE | re.DOTALL)
TAG = re.compile(r"<[^>]+>")
UNNAMED = re.compile(r"^(?:หมู่(?:บ้าน)?(?:ที่)?\s*\d+|ม\.\s*\d+)$")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized(value: object) -> str:
    return unicodedata.normalize("NFC", str(value or "").strip())


def artifact_set_sha256(paths: list[Path]) -> str:
    lines = "".join(f"{path.name}:{sha256(path)}\n" for path in sorted(paths))
    return hashlib.sha256(lines.encode()).hexdigest()


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
    rows = []
    for row in sheet.findall(f".//{namespace}row"):
        values = {}
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


def read_parent_names(path: Path) -> dict[str, dict[str, str]]:
    parents = {}
    for row in read_xlsx_rows(path):
        raw_code = row.get("A", "")
        if not raw_code.isdigit():
            continue
        code = raw_code.zfill(8)
        if code[:2] == "10" or code[2:4] == "00" or code[4:6] == "00" or code[6:] != "00":
            continue
        if row.get("D", "0") not in {"", "0"}:
            continue
        parents[code[:6]] = {
            "nameTh": normalized(row.get("B")).removesuffix("*"),
            "nameEn": normalized(row.get("C")),
        }
    return parents


def artifact_metadata(catalog: str, paths: list[Path], period: str) -> list[dict[str, object]]:
    metadata = []
    for path in sorted(paths):
        province_code = path.name[2:4]
        direct = f"../file/69/{period[-2:]}/{path.name}" in catalog
        metadata.append(
            {
                "provinceCode": province_code,
                "artifactName": path.name,
                "retrievalMethod": "direct_static" if direct else "catalog_form_export",
                "artifactUrl": (
                    f"https://stat.bora.dopa.go.th/new_stat/file/69/{period[-2:]}/{path.name}"
                    if direct
                    else "https://stat.bora.dopa.go.th/new_stat/exportfile3.php"
                ),
                "requestParameters": None if direct else {"filemoo_send": path.stem},
                "sha256": sha256(path),
            }
        )
    return metadata


def read_month(paths: list[Path], period: str) -> tuple[dict[str, dict[str, object]], list[str]]:
    records: dict[str, dict[str, object]] = {}
    registration_offices: defaultdict[str, set[str]] = defaultdict(set)
    failures = []
    for path in sorted(paths):
        expected_province = path.name[2:4]
        text = path.read_text(encoding="utf-8-sig")
        for row_match in TR.finditer(text):
            cells = [
                normalized(html.unescape(TAG.sub("", value)))
                for value in TD.findall(row_match.group(1))[:9]
            ]
            if len(cells) < 9 or not all(cells[index].isdigit() for index in (1, 5, 7)):
                continue
            represented_period = cells[0].lstrip("\ufeff")
            if represented_period != period:
                failures.append(f"{path.name}: expected period {period}, found {represented_period}")
                continue
            province_code = cells[1].zfill(2)
            tambon_code = cells[5].zfill(6)
            code = cells[7].zfill(8)
            if province_code != expected_province:
                failures.append(f"{path.name}: contains province {province_code}")
            identity = {
                "code": code,
                "nameTh": cells[8],
                "parentTambonCode": tambon_code,
                "parentProvinceCode": f"TH-{province_code}",
            }
            existing = records.get(code)
            if existing is not None and existing != identity:
                failures.append(f"{code}: conflicting identity rows")
            records[code] = identity
            registration_offices[code].add(cells[3].zfill(4))
    for code, offices in registration_offices.items():
        if code in records:
            records[code]["registrationOfficeObservationCount"] = len(offices)
    return records, failures


def build(
    ccaatt_path: Path,
    march_directory: Path,
    july_directory: Path,
    march_catalog_path: Path,
    july_catalog_path: Path,
) -> None:
    failures = []
    march_paths = sorted(march_directory.glob("7_*_6903.xls"))
    july_paths = sorted(july_directory.glob("7_*_6907.xls"))
    if sha256(ccaatt_path) != CCAATT_SHA256:
        failures.append("CCAATT parent snapshot checksum mismatch")
    if len(march_paths) != 77 or artifact_set_sha256(march_paths) != MARCH_SET_SHA256:
        failures.append("March village artifact set is incomplete or changed")
    if len(july_paths) != 77 or artifact_set_sha256(july_paths) != JULY_SET_SHA256:
        failures.append("July village artifact set is incomplete or changed")
    if sha256(march_catalog_path) != MARCH_CATALOG_SHA256:
        failures.append("March catalog checksum mismatch")
    if sha256(july_catalog_path) != JULY_CATALOG_SHA256:
        failures.append("July catalog checksum mismatch")

    subdistrict_payload = json.loads(
        (ROOT / "data/research/thailand-subdistrict-evidence.json").read_text(encoding="utf-8")
    )
    tambons = {
        record["code"]: record
        for record in subdistrict_payload["records"]
        if record["administrativeType"] == "tambon"
    }
    parent_names = read_parent_names(ccaatt_path)
    march_all, march_failures = read_month(march_paths, "6903")
    july_all, july_failures = read_month(july_paths, "6907")
    failures.extend(march_failures)
    failures.extend(july_failures)

    def numbered_provincial(source: dict[str, dict[str, object]]) -> dict[str, dict[str, object]]:
        return {
            code: identity
            for code, identity in source.items()
            if not code.startswith("10") and not code.endswith("00")
        }

    march = numbered_provincial(march_all)
    july = numbered_provincial(july_all)
    records = []
    for code, identity in sorted(july.items()):
        tambon_code = code[:6]
        parent = tambons.get(tambon_code)
        source_parent = parent_names.get(tambon_code)
        if parent is None or source_parent is None:
            failures.append(f"{code}: unknown parent tambon")
            continue
        if identity["parentTambonCode"] != tambon_code:
            failures.append(f"{code}: parent code differs from authoritative code prefix")
        if identity["parentProvinceCode"] != parent["parentProvinceCode"]:
            failures.append(f"{code}: cross-province relationship")
        if source_parent["nameTh"] != parent["nameTh"]:
            failures.append(f"{code}: parent Thai name differs from CCAATT")
        records.append(
            {
                "code": code,
                "villageNumber": int(code[6:]),
                "nameTh": identity["nameTh"],
                "nameEn": "",
                "administrativeType": "village",
                "parentTambonCode": tambon_code,
                "parentTambonNameTh": parent["nameTh"],
                "parentTambonNameEn": parent["nameEn"],
                "parentAmphoeCode": parent["parentDistrictCode"],
                "parentAmphoeNameTh": parent["parentDistrictNameTh"],
                "parentAmphoeNameEn": parent["parentDistrictNameEn"],
                "parentProvinceCode": parent["parentProvinceCode"],
                "parentProvinceNameTh": parent["parentProvinceNameTh"],
                "parentProvinceNameEn": parent["parentProvinceNameEn"],
                "region": parent["region"],
                "sourceReferences": ["DOPA-CCAATT-2023-09-01", "DOPA-VILLAGE-2026-07"],
                "representedAt": "2026-07",
                "lifecycleStatus": "observed_current_snapshot",
                "identityVerificationStatus": "verified_authoritative_snapshot",
                "englishNameStatus": "pending",
                "rightsStatus": "pending_explicit_redistribution_terms",
                "boundaryStatus": "pending",
                "publicationEligibility": "blocked",
                "conflicts": [],
                "notes": ["research_only", "redistribution_rights_pending"],
            }
        )

    village_codes = {record["code"] for record in records}
    covered_tambons = {record["parentTambonCode"] for record in records}
    new_since_march = sorted(set(july) - set(march))
    absent_since_march = sorted(set(march) - set(july))
    identity_fields = ("code", "nameTh", "parentTambonCode", "parentProvinceCode")
    changed = sorted(
        code
        for code in set(march) & set(july)
        if any(march[code][field] != july[code][field] for field in identity_fields)
    )
    zero_tambons = sorted(set(tambons) - covered_tambons)
    unnamed = [record["code"] for record in records if UNNAMED.fullmatch(record["nameTh"])]
    province_counts = Counter(record["parentProvinceCode"] for record in records)
    district_counts = Counter(record["parentAmphoeCode"] for record in records)
    tambon_counts = Counter(record["parentTambonCode"] for record in records)
    village_numbers = [(record["parentTambonCode"], record["villageNumber"]) for record in records]

    checks = {
        "authoritativeTotal": len(records) == EXPECTED_VILLAGES,
        "provinceCoverage": len(province_counts) == EXPECTED_PROVINCES,
        "amphoeCoverage": len(district_counts) == EXPECTED_DISTRICTS,
        "parentTambonUniverse": len(tambons) == EXPECTED_TAMBONS,
        "uniqueCodes": len(village_codes) == len(records),
        "uniqueVillageNumberWithinTambon": len(village_numbers) == len(set(village_numbers)),
        "noBangkok": not any(code.startswith("10") for code in village_codes),
        "noOrphans": all(record["parentTambonCode"] in tambons for record in records),
        "monthlyIdentityConsistency": not changed,
    }
    if failures or not all(checks.values()):
        raise SystemExit("\n".join(failures + [key for key, passed in checks.items() if not passed]))

    payload = {
        "status": "research_evidence_only",
        "publicationEligibility": "blocked",
        "representedAt": "2026-07",
        "records": records,
    }
    march_catalog = march_catalog_path.read_text(encoding="utf-8")
    july_catalog = july_catalog_path.read_text(encoding="utf-8")
    manifest = {
        "status": "research_evidence_only",
        "publicationEligibility": "blocked",
        "sourceRegister": [
            {
                "reference": "DOPA-CCAATT-2023-09-01",
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": "https://stat.bora.dopa.go.th/dload/ccaatt.xlsx",
                "retrievedAt": "2026-08-21",
                "representedAt": "2023-09-01",
                "evidenceLocator": "active provincial CCAATT00 rows; authoritative parent tambon, amphoe and province names/codes only",
                "sha256": CCAATT_SHA256,
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
            {
                "reference": "DOPA-VILLAGE-2026-03",
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": "https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=03&year=69",
                "retrievedAt": "2026-08-21",
                "representedAt": "2026-03",
                "queryParameters": {"month": "03", "year": "69"},
                "evidenceLocator": "77 province artifacts listed by the March 2569 village-level catalog; only identity columns 1-9 were read",
                "catalogSha256": MARCH_CATALOG_SHA256,
                "artifactSetSha256": MARCH_SET_SHA256,
                "artifacts": artifact_metadata(march_catalog, march_paths, "6903"),
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
            {
                "reference": "DOPA-VILLAGE-2026-07",
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": "https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=07&year=69",
                "retrievedAt": "2026-08-21",
                "representedAt": "2026-07",
                "queryParameters": {"month": "07", "year": "69"},
                "evidenceLocator": "77 province artifacts listed by the July 2569 village-level catalog; only identity columns 1-9 were read",
                "catalogSha256": JULY_CATALOG_SHA256,
                "artifactSetSha256": JULY_SET_SHA256,
                "artifacts": artifact_metadata(july_catalog, july_paths, "6907"),
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
        ],
        "authoritativeTotals": {
            "currentVillages": len(records),
            "provincialProvinces": len(province_counts),
            "provincialAmphoe": len(district_counts),
            "parentTambon": len(tambons),
            "tambonWithVillages": len(covered_tambons),
            "tambonWithZeroVillages": len(zero_tambons),
            "bangkokVillages": 0,
            "explicitInactiveOrCancelled": 0,
            "unnamedIdentityLabels": len(unnamed),
            "englishNameGaps": len(records),
        },
        "provinceCounts": dict(sorted(province_counts.items())),
        "amphoeCounts": dict(sorted(district_counts.items())),
        "tambonCounts": {code: tambon_counts.get(code, 0) for code in sorted(tambons)},
        "zeroVillageTambons": [
            {
                "tambonCode": code,
                "tambonNameTh": tambons[code]["nameTh"],
                "amphoeCode": tambons[code]["parentDistrictCode"],
                "amphoeNameTh": tambons[code]["parentDistrictNameTh"],
                "provinceCode": tambons[code]["parentProvinceCode"],
                "provinceNameTh": tambons[code]["parentProvinceNameTh"],
                "reason": "no_numbered_village_record_in_2026_07_source",
            }
            for code in zero_tambons
        ],
        "unnamedRecords": unnamed,
        "monthlyReconciliation": {
            "marchCurrentVillageCount": len(march),
            "julyCurrentVillageCount": len(july),
            "newlyObservedInJuly": new_since_march,
            "notObservedInJuly": absent_since_march,
            "identityConflicts": changed,
            "notObservedLifecycleStatus": "unresolved_not_inferred_as_inactive_or_cancelled",
        },
        "checks": checks,
    }
    (ROOT / "data/research/thailand-village-evidence.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (ROOT / "data/research/thailand-village-evidence.manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"Built {len(records)} blocked village identities; {len(zero_tambons)} tambons have no numbered village records"
    )


if __name__ == "__main__":
    if len(sys.argv) != 6:
        raise SystemExit(
            "usage: build-thailand-village-registry.py CCAATT_XLSX MARCH_DIR JULY_DIR MARCH_CATALOG JULY_CATALOG"
        )
    build(*(Path(argument) for argument in sys.argv[1:]))
