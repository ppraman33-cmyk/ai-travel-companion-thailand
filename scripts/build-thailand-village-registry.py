#!/usr/bin/env python3
"""Build compact, quarantined Thailand village identity research shards."""

from __future__ import annotations

import hashlib
import html
import json
import re
import shutil
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data/research/thailand-village-evidence"
CCAATT_SHA256 = "5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9"
MARCH_SET_SHA256 = "929fc5af4eda9fecece162eb726e3d3e970e6bb81b624b85f58330fb745e39a8"
JULY_SET_SHA256 = "d5a1f84a37ac56575a3ed316b00248d77313e6df5bb40ed5acc07aa3166496b8"
MARCH_CATALOG_SHA256 = "453326c81d62bd811ca3edcdc24d66804c62720923a6ce8db12327d8411dd459"
JULY_CATALOG_SHA256 = "54071e5c890433b73f4ca1646ad48ea26c062a14f4c8df051528fd7677868eae"
CANONICAL_RECORDS_SHA256 = "c6747dbc350d9e16ab21ba05535d911625a7b3ef0823c2ae0fe81a3210b7d333"
EXPECTED_VILLAGES = 75_652

TD = re.compile(r"<td(?: [^>]*)?>(.*?)</td>", re.IGNORECASE | re.DOTALL)
TR = re.compile(r"<tr>(.*?)</tr>", re.IGNORECASE | re.DOTALL)
TAG = re.compile(r"<[^>]+>")
UNNAMED = re.compile(r"^(?:หมู่(?:บ้าน)?(?:ที่)?\s*\d+|ม\.\s*\d+)$")


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def normalized(value: object) -> str:
    return unicodedata.normalize("NFC", str(value or "").strip())


def artifact_set_sha256(paths: list[Path]) -> str:
    value = "".join(f"{path.name}:{sha256(path)}\n" for path in sorted(paths))
    return digest_bytes(value.encode())


def canonical_sha256(value: object) -> str:
    serialized = json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode()
    return digest_bytes(serialized)


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
        code = row.get("A", "").zfill(8)
        if not code.isdigit():
            continue
        if code[:2] == "10" or "00" in (code[2:4], code[4:6]) or code[6:] != "00":
            continue
        if row.get("D", "0") not in {"", "0"}:
            continue
        parents[code[:6]] = {
            "nameTh": normalized(row.get("B")).removesuffix("*"),
            "nameEn": normalized(row.get("C")),
        }
    return parents


def read_month(paths: list[Path], period: str) -> tuple[dict[str, dict[str, str]], list[str]]:
    records = {}
    failures = []
    for path in sorted(paths):
        expected_province = path.name[2:4]
        for row in TR.finditer(path.read_text(encoding="utf-8-sig")):
            cells = [
                normalized(html.unescape(TAG.sub("", value)))
                for value in TD.findall(row.group(1))[:9]
            ]
            if len(cells) < 9 or not all(cells[index].isdigit() for index in (1, 5, 7)):
                continue
            if cells[0].lstrip("\ufeff") != period:
                failures.append(f"{path.name}: represented period differs from {period}")
                continue
            province_code = cells[1].zfill(2)
            code = cells[7].zfill(8)
            if province_code != expected_province:
                failures.append(f"{path.name}: contains province {province_code}")
            identity = {
                "code": code,
                "nameTh": cells[8],
                "parentTambonCode": cells[5].zfill(6),
                "parentProvinceCode": f"TH-{province_code}",
            }
            existing = records.get(code)
            if existing is not None and existing != identity:
                failures.append(f"{code}: conflicting identity rows")
            records[code] = identity
    return records, failures


def numbered_provincial(source: dict[str, dict[str, str]]) -> dict[str, dict[str, str]]:
    return {
        code: identity
        for code, identity in source.items()
        if not code.startswith("10") and not code.endswith("00")
    }


def artifact_metadata(catalog: str, paths: list[Path], period: str) -> list[dict[str, object]]:
    artifacts = []
    for path in sorted(paths):
        province_code = path.name[2:4]
        direct = f"../file/69/{period[-2:]}/{path.name}" in catalog
        artifacts.append(
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
    return artifacts


def reconstruct_record(row: list[object], parent: dict[str, object]) -> dict[str, object]:
    code, village_number, name_th, tambon_code = row
    return {
        "code": code,
        "villageNumber": village_number,
        "nameTh": name_th,
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


def build(ccaatt: Path, evidence_dir: Path, march_catalog: Path, july_catalog: Path) -> None:
    failures = []
    march_paths = sorted(evidence_dir.glob("7_*_6903.xls"))
    july_paths = sorted(evidence_dir.glob("7_*_6907.xls"))
    expected_inputs = (
        (sha256(ccaatt), CCAATT_SHA256, "CCAATT"),
        (artifact_set_sha256(march_paths), MARCH_SET_SHA256, "March artifact set"),
        (artifact_set_sha256(july_paths), JULY_SET_SHA256, "July artifact set"),
        (sha256(march_catalog), MARCH_CATALOG_SHA256, "March catalog"),
        (sha256(july_catalog), JULY_CATALOG_SHA256, "July catalog"),
    )
    for actual, expected, label in expected_inputs:
        if actual != expected:
            failures.append(f"{label} checksum mismatch")
    if len(march_paths) != 77 or len(july_paths) != 77:
        failures.append("each represented month must contain exactly 77 province artifacts")

    subdistricts = json.loads(
        (ROOT / "data/research/thailand-subdistrict-evidence.json").read_text(encoding="utf-8")
    )["records"]
    tambons = {
        record["code"]: record
        for record in subdistricts
        if record["administrativeType"] == "tambon"
    }
    parent_names = read_parent_names(ccaatt)
    march_all, march_failures = read_month(march_paths, "6903")
    july_all, july_failures = read_month(july_paths, "6907")
    failures.extend(march_failures + july_failures)
    march = numbered_provincial(march_all)
    july = numbered_provincial(july_all)

    rows_by_province: defaultdict[str, list[list[object]]] = defaultdict(list)
    reconstructed = []
    for code, identity in sorted(july.items()):
        tambon_code = code[:6]
        parent = tambons.get(tambon_code)
        source_parent = parent_names.get(tambon_code)
        if parent is None or source_parent is None:
            failures.append(f"{code}: unknown parent tambon")
            continue
        if identity["parentTambonCode"] != tambon_code:
            failures.append(f"{code}: parent tambon differs from code prefix")
        if identity["parentProvinceCode"] != parent["parentProvinceCode"]:
            failures.append(f"{code}: cross-province relationship")
        if source_parent["nameTh"] != parent["nameTh"]:
            failures.append(f"{code}: CCAATT parent Thai name mismatch")
        row = [code, int(code[6:]), identity["nameTh"], tambon_code]
        rows_by_province[parent["parentProvinceCode"]].append(row)
        reconstructed.append(reconstruct_record(row, parent))

    identity_fields = ("code", "nameTh", "parentTambonCode", "parentProvinceCode")
    changed = sorted(
        code
        for code in set(march) & set(july)
        if any(march[code][field] != july[code][field] for field in identity_fields)
    )
    village_numbers = [(row[3], row[1]) for rows in rows_by_province.values() for row in rows]
    covered_tambons = {row[3] for rows in rows_by_province.values() for row in rows}
    zero_tambons = sorted(set(tambons) - covered_tambons)
    if len(reconstructed) != EXPECTED_VILLAGES:
        failures.append(f"expected {EXPECTED_VILLAGES} villages, found {len(reconstructed)}")
    if len(rows_by_province) != 76:
        failures.append("expected 76 provincial shards")
    if len({record["parentAmphoeCode"] for record in reconstructed}) != 878:
        failures.append("expected 878 amphoe")
    if len(village_numbers) != len(set(village_numbers)):
        failures.append("duplicate village number within parent tambon")
    if changed:
        failures.append("March-to-July identity conflicts found")
    if canonical_sha256(reconstructed) != CANONICAL_RECORDS_SHA256:
        failures.append("canonical reconstructed records differ from reviewed PR #11 semantics")
    if failures:
        raise SystemExit("\n".join(failures))

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)
    storage_files = []
    for province_code, rows in sorted(rows_by_province.items()):
        path = OUTPUT / f"{province_code}.json"
        shard = {
            "schemaVersion": 1,
            "provinceCode": province_code,
            "columns": ["code", "villageNumber", "nameTh", "parentTambonCode"],
            "records": rows,
        }
        path.write_text(json.dumps(shard, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        storage_files.append(
            {
                "path": str(path.relative_to(ROOT)),
                "provinceCode": province_code,
                "recordCount": len(rows),
                "sha256": sha256(path),
                "bytes": path.stat().st_size,
            }
        )

    province_counts = Counter(record["parentProvinceCode"] for record in reconstructed)
    amphoe_counts = Counter(record["parentAmphoeCode"] for record in reconstructed)
    tambon_counts = Counter(record["parentTambonCode"] for record in reconstructed)
    unnamed = [record["code"] for record in reconstructed if UNNAMED.fullmatch(record["nameTh"])]
    march_catalog_text = march_catalog.read_text(encoding="utf-8")
    july_catalog_text = july_catalog.read_text(encoding="utf-8")
    manifest = {
        "schemaVersion": 2,
        "status": "research_evidence_only",
        "publicationEligibility": "blocked",
        "storage": {
            "format": "normalized_province_shards",
            "columns": ["code", "villageNumber", "nameTh", "parentTambonCode"],
            "files": storage_files,
            "totalBytes": sum(item["bytes"] for item in storage_files),
            "maxFileBytes": max(item["bytes"] for item in storage_files),
            "canonicalRecordsSha256": CANONICAL_RECORDS_SHA256,
            "canonicalRecordCount": len(reconstructed),
        },
        "recordDefaults": {
            "nameEn": "",
            "administrativeType": "village",
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
        },
        "parentJoin": {
            "registry": "data/research/thailand-subdistrict-evidence.json",
            "key": "parentTambonCode",
            "derives": [
                "parentTambonNameTh",
                "parentTambonNameEn",
                "parentAmphoeCode",
                "parentAmphoeNameTh",
                "parentAmphoeNameEn",
                "parentProvinceCode",
                "parentProvinceNameTh",
                "parentProvinceNameEn",
                "region",
            ],
        },
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
                "evidenceLocator": "77 province artifacts; only administrative identity columns 1-9 were read",
                "catalogSha256": MARCH_CATALOG_SHA256,
                "artifactSetSha256": MARCH_SET_SHA256,
                "artifacts": artifact_metadata(march_catalog_text, march_paths, "6903"),
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
            {
                "reference": "DOPA-VILLAGE-2026-07",
                "publisher": "Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior",
                "sourceUrl": "https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=07&year=69",
                "retrievedAt": "2026-08-21",
                "representedAt": "2026-07",
                "queryParameters": {"month": "07", "year": "69"},
                "evidenceLocator": "77 province artifacts; only administrative identity columns 1-9 were read",
                "catalogSha256": JULY_CATALOG_SHA256,
                "artifactSetSha256": JULY_SET_SHA256,
                "artifacts": artifact_metadata(july_catalog_text, july_paths, "6907"),
                "rightsStatus": "pending_explicit_redistribution_terms",
            },
        ],
        "authoritativeTotals": {
            "currentVillages": len(reconstructed),
            "provincialProvinces": len(province_counts),
            "provincialAmphoe": len(amphoe_counts),
            "parentTambon": len(tambons),
            "tambonWithVillages": len(covered_tambons),
            "tambonWithZeroVillages": len(zero_tambons),
            "bangkokVillages": 0,
            "explicitInactiveOrCancelled": 0,
            "unnamedIdentityLabels": len(unnamed),
            "englishNameGaps": len(reconstructed),
        },
        "provinceCounts": dict(sorted(province_counts.items())),
        "amphoeCounts": dict(sorted(amphoe_counts.items())),
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
            "newlyObservedInJuly": sorted(set(july) - set(march)),
            "notObservedInJuly": sorted(set(march) - set(july)),
            "identityConflicts": changed,
            "notObservedLifecycleStatus": "unresolved_not_inferred_as_inactive_or_cancelled",
        },
    }
    (ROOT / "data/research/thailand-village-evidence.manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"Built {len(reconstructed)} records in {len(storage_files)} shards; "
        f"{sum(item['bytes'] for item in storage_files)} bytes"
    )


if __name__ == "__main__":
    if len(sys.argv) != 5:
        raise SystemExit(
            "usage: build-thailand-village-registry.py CCAATT_XLSX EVIDENCE_DIR MARCH_CATALOG JULY_CATALOG"
        )
    build(*(Path(value) for value in sys.argv[1:]))
