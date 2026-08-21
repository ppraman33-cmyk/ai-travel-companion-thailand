import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

import { loadVillageEvidence } from "./load-thailand-village-evidence.mjs";

const root = process.cwd();
const PROHIBITED_FIELDS = new Set([
  "population",
  "demographics",
  "households",
  "houseNumber",
  "gender",
  "age",
  "nationality",
  "religion",
  "personName",
  "phone",
  "coordinates",
  "geometry",
]);

export function validateVillageEvidence(records, tambons) {
  const failures = [];
  const parentByCode = new Map(
    tambons
      .filter(({ administrativeType }) => administrativeType === "tambon")
      .map((record) => [record.code, record]),
  );
  const codes = new Set();
  const numbers = new Set();
  const provinces = new Set();
  const amphoe = new Set();
  const coveredTambons = new Set();
  if (records.length !== 75652)
    failures.push(`expected 75652 records, found ${records.length}`);
  for (const record of records) {
    if (!/^\d{8}$/.test(record.code)) failures.push(`${record.code}: invalid code`);
    if (record.code?.startsWith("10"))
      failures.push(`${record.code}: Bangkok prohibited`);
    if (record.code?.endsWith("00")) failures.push(`${record.code}: not numbered`);
    if (codes.has(record.code)) failures.push(`${record.code}: duplicate code`);
    codes.add(record.code);
    if (record.villageNumber !== Number(record.code?.slice(6)))
      failures.push(`${record.code}: village number mismatch`);
    const numberKey = `${record.parentTambonCode}:${record.villageNumber}`;
    if (numbers.has(numberKey))
      failures.push(`${record.code}: duplicate number within tambon`);
    numbers.add(numberKey);
    const parent = parentByCode.get(record.parentTambonCode);
    if (!parent) failures.push(`${record.code}: unknown parent tambon`);
    if (
      record.parentTambonCode !== record.code?.slice(0, 6) ||
      record.parentAmphoeCode !== record.code?.slice(0, 4) ||
      record.parentProvinceCode !== `TH-${record.code?.slice(0, 2)}`
    )
      failures.push(`${record.code}: code-derived parent mismatch`);
    if (
      parent &&
      (parent.parentDistrictCode !== record.parentAmphoeCode ||
        parent.parentProvinceCode !== record.parentProvinceCode)
    )
      failures.push(`${record.code}: cross-parent relationship`);
    if (!record.nameTh?.trim() || record.nameTh !== record.nameTh.normalize("NFC"))
      failures.push(`${record.code}: invalid Thai name`);
    if (record.nameEn !== "" || record.englishNameStatus !== "pending")
      failures.push(`${record.code}: English name must remain empty and pending`);
    if (
      record.lifecycleStatus !== "observed_current_snapshot" ||
      record.identityVerificationStatus !== "verified_authoritative_snapshot"
    )
      failures.push(`${record.code}: unsupported identity/lifecycle assertion`);
    if (
      record.rightsStatus !== "pending_explicit_redistribution_terms" ||
      record.boundaryStatus !== "pending" ||
      record.publicationEligibility !== "blocked"
    )
      failures.push(`${record.code}: research gate relaxed`);
    for (const key of Object.keys(record)) {
      if (PROHIBITED_FIELDS.has(key))
        failures.push(`${record.code}: prohibited field ${key}`);
    }
    provinces.add(record.parentProvinceCode);
    amphoe.add(record.parentAmphoeCode);
    coveredTambons.add(record.parentTambonCode);
  }
  if (parentByCode.size !== 7256) failures.push("parent tambon universe must be 7256");
  if (provinces.size !== 76) failures.push("province coverage must be 76");
  if (amphoe.size !== 878) failures.push("amphoe coverage must be 878");
  if (coveredTambons.size !== 7111) failures.push("covered tambon count must be 7111");
  return failures;
}

export function validateVillageManifest(manifest, scanRoot = root) {
  const failures = [];
  if (
    manifest?.schemaVersion !== 2 ||
    manifest?.status !== "research_evidence_only" ||
    manifest?.publicationEligibility !== "blocked"
  )
    failures.push("root research contract invalid");
  if (
    manifest?.storage?.format !== "normalized_province_shards" ||
    manifest?.storage?.files?.length !== 76 ||
    manifest?.storage?.canonicalRecordCount !== 75652 ||
    manifest?.storage?.canonicalRecordsSha256 !==
      "c6747dbc350d9e16ab21ba05535d911625a7b3ef0823c2ae0fe81a3210b7d333"
  )
    failures.push("compact storage contract invalid");
  if (manifest?.storage?.totalBytes > 25_000_000)
    failures.push("compact storage exceeds 25 MB target");
  if (manifest?.storage?.maxFileBytes >= 10_000_000)
    failures.push("compact shard exceeds 10 MB");
  for (const file of manifest?.storage?.files ?? []) {
    const path = resolve(scanRoot, file.path);
    if (statSync(path).size !== file.bytes || file.bytes >= 10_000_000)
      failures.push(`${file.path}: invalid size contract`);
  }
  const defaults = manifest?.recordDefaults ?? {};
  if (
    defaults.rightsStatus !== "pending_explicit_redistribution_terms" ||
    defaults.boundaryStatus !== "pending" ||
    defaults.publicationEligibility !== "blocked" ||
    defaults.lifecycleStatus !== "observed_current_snapshot" ||
    defaults.englishNameStatus !== "pending" ||
    defaults.nameEn !== ""
  )
    failures.push("normalized record defaults are not fail-closed");
  if (manifest?.sourceRegister?.length !== 3) failures.push("expected three sources");
  for (const source of manifest?.sourceRegister ?? []) {
    if (
      !source.sourceUrl?.startsWith("https://") ||
      !source.publisher ||
      !source.retrievedAt ||
      !source.representedAt ||
      !source.evidenceLocator ||
      source.rightsStatus !== "pending_explicit_redistribution_terms"
    )
      failures.push(`${source.reference}: incomplete provenance`);
  }
  for (const month of ["03", "07"]) {
    const source = manifest.sourceRegister?.find(
      ({ reference }) => reference === `DOPA-VILLAGE-2026-${month}`,
    );
    if (
      source?.representedAt !== `2026-${month}` ||
      source?.queryParameters?.month !== month ||
      source?.queryParameters?.year !== "69" ||
      source?.artifacts?.length !== 77 ||
      !/^[a-f0-9]{64}$/.test(source?.catalogSha256 ?? "") ||
      !/^[a-f0-9]{64}$/.test(source?.artifactSetSha256 ?? "")
    )
      failures.push(`monthly source ${month} provenance invalid`);
  }
  const totals = manifest?.authoritativeTotals ?? {};
  if (
    totals.currentVillages !== 75652 ||
    totals.provincialProvinces !== 76 ||
    totals.provincialAmphoe !== 878 ||
    totals.parentTambon !== 7256 ||
    totals.tambonWithVillages !== 7111 ||
    totals.tambonWithZeroVillages !== 145 ||
    totals.bangkokVillages !== 0 ||
    totals.explicitInactiveOrCancelled !== 0 ||
    totals.unnamedIdentityLabels !== 384 ||
    totals.englishNameGaps !== 75652
  )
    failures.push("authoritative totals mismatch");
  if (Object.keys(manifest?.provinceCounts ?? {}).length !== 76)
    failures.push("province matrix must contain 76 entries");
  if (Object.keys(manifest?.amphoeCounts ?? {}).length !== 878)
    failures.push("amphoe matrix must contain 878 entries");
  if (Object.keys(manifest?.tambonCounts ?? {}).length !== 7256)
    failures.push("tambon matrix must contain 7256 entries");
  if (manifest?.zeroVillageTambons?.length !== 145)
    failures.push("zero-village list must contain 145 entries");
  if (
    manifest?.monthlyReconciliation?.newlyObservedInJuly?.length !== 6 ||
    manifest?.monthlyReconciliation?.notObservedInJuly?.length !== 1 ||
    manifest?.monthlyReconciliation?.identityConflicts?.length !== 0 ||
    manifest?.monthlyReconciliation?.notObservedLifecycleStatus !==
      "unresolved_not_inferred_as_inactive_or_cancelled"
  )
    failures.push("monthly reconciliation contract invalid");
  return failures;
}

export function findVillageRuntimeLeakage(scanRoot = root) {
  const roots = ["app", "application", "components", "public", "infrastructure"];
  const needle = "thailand-village-evidence";
  const leaks = [];
  for (const directory of roots) {
    const path = resolve(scanRoot, directory);
    let entries = [];
    try {
      entries = readdirSync(path, { recursive: true, withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const file = resolve(entry.parentPath, entry.name);
      if (readFileSync(file, "utf8").includes(needle)) leaks.push(file);
    }
  }
  return leaks;
}

export function findCommittedVillageSourceBinaries(scanRoot = root) {
  const allowed = new Set([".json", ".md", ".mjs", ".mts", ".py", ".ts"]);
  return readdirSync(resolve(scanRoot, "data/research"), {
    recursive: true,
    withFileTypes: true,
  })
    .filter(
      (entry) => entry.isFile() && !allowed.has(extname(entry.name).toLowerCase()),
    )
    .map((entry) => resolve(entry.parentPath, entry.name));
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) ===
    resolve(root, "scripts/validate-thailand-village-evidence.mjs")
) {
  const { manifest, records, canonicalRecordsSha256 } = loadVillageEvidence(root);
  const tambons = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-subdistrict-evidence.json"),
      "utf8",
    ),
  ).records;
  const failures = [
    ...validateVillageEvidence(records, tambons),
    ...validateVillageManifest(manifest, root),
    ...findVillageRuntimeLeakage(root).map((file) => `runtime leakage: ${file}`),
    ...findCommittedVillageSourceBinaries(root).map((file) => `source binary: ${file}`),
  ];
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    `Village evidence OK: ${records.length} records, canonical sha256:${canonicalRecordsSha256}`,
  );
}
