import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

export function canonicalVillageRecordsSha256(records) {
  return sha256(JSON.stringify(stableValue(records)));
}

export function loadVillageEvidence(scanRoot = process.cwd()) {
  const manifest = JSON.parse(
    readFileSync(
      resolve(scanRoot, "data/research/thailand-village-evidence.manifest.json"),
      "utf8",
    ),
  );
  const subdistricts = JSON.parse(
    readFileSync(
      resolve(scanRoot, "data/research/thailand-subdistrict-evidence.json"),
      "utf8",
    ),
  ).records;
  const tambons = new Map(
    subdistricts
      .filter(({ administrativeType }) => administrativeType === "tambon")
      .map((record) => [record.code, record]),
  );
  const records = [];
  for (const file of manifest.storage.files) {
    const bytes = readFileSync(resolve(scanRoot, file.path));
    if (sha256(bytes) !== file.sha256)
      throw new Error(`${file.path}: checksum mismatch`);
    const shard = JSON.parse(bytes.toString("utf8"));
    if (
      shard.schemaVersion !== 1 ||
      shard.provinceCode !== file.provinceCode ||
      JSON.stringify(shard.columns) !== JSON.stringify(manifest.storage.columns) ||
      shard.records.length !== file.recordCount
    )
      throw new Error(`${file.path}: shard contract mismatch`);
    for (const [code, villageNumber, nameTh, parentTambonCode] of shard.records) {
      const parent = tambons.get(parentTambonCode);
      if (!parent) throw new Error(`${code}: unknown parent tambon`);
      records.push({
        code,
        villageNumber,
        nameTh,
        nameEn: manifest.recordDefaults.nameEn,
        administrativeType: manifest.recordDefaults.administrativeType,
        parentTambonCode,
        parentTambonNameTh: parent.nameTh,
        parentTambonNameEn: parent.nameEn,
        parentAmphoeCode: parent.parentDistrictCode,
        parentAmphoeNameTh: parent.parentDistrictNameTh,
        parentAmphoeNameEn: parent.parentDistrictNameEn,
        parentProvinceCode: parent.parentProvinceCode,
        parentProvinceNameTh: parent.parentProvinceNameTh,
        parentProvinceNameEn: parent.parentProvinceNameEn,
        region: parent.region,
        sourceReferences: [...manifest.recordDefaults.sourceReferences],
        representedAt: manifest.recordDefaults.representedAt,
        lifecycleStatus: manifest.recordDefaults.lifecycleStatus,
        identityVerificationStatus: manifest.recordDefaults.identityVerificationStatus,
        englishNameStatus: manifest.recordDefaults.englishNameStatus,
        rightsStatus: manifest.recordDefaults.rightsStatus,
        boundaryStatus: manifest.recordDefaults.boundaryStatus,
        publicationEligibility: manifest.recordDefaults.publicationEligibility,
        conflicts: [...manifest.recordDefaults.conflicts],
        notes: [...manifest.recordDefaults.notes],
      });
    }
  }
  const checksum = canonicalVillageRecordsSha256(records);
  if (records.length !== manifest.storage.canonicalRecordCount)
    throw new Error("canonical record count mismatch");
  if (checksum !== manifest.storage.canonicalRecordsSha256)
    throw new Error("canonical record checksum mismatch");
  return { manifest, records, canonicalRecordsSha256: checksum };
}
