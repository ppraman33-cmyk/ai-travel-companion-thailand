import { readFileSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";

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

export function validateVillageEvidence(payload, tambons) {
  const failures = [];
  const records = payload?.records ?? [];
  const tambonByCode = new Map(
    tambons
      .filter(({ administrativeType }) => administrativeType === "tambon")
      .map((record) => [record.code, record]),
  );
  const codes = new Set();
  const numbersWithinTambon = new Set();
  const provinceCodes = new Set();
  const amphoeCodes = new Set();
  const coveredTambons = new Set();

  if (payload?.status !== "research_evidence_only")
    failures.push("registry must remain research_evidence_only");
  if (payload?.publicationEligibility !== "blocked")
    failures.push("registry publication must remain blocked");
  if (payload?.representedAt !== "2026-07")
    failures.push("registry must remain bound to represented month 2026-07");
  if (records.length !== 75652)
    failures.push(`expected 75652 records, found ${records.length}`);

  for (const record of records) {
    if (!/^\d{8}$/.test(record.code)) failures.push(`${record.code}: invalid code`);
    if (record.code?.startsWith("10"))
      failures.push(`${record.code}: Bangkok prohibited`);
    if (record.code?.endsWith("00"))
      failures.push(`${record.code}: not a numbered village`);
    if (codes.has(record.code)) failures.push(`${record.code}: duplicate code`);
    codes.add(record.code);
    if (record.administrativeType !== "village")
      failures.push(`${record.code}: invalid administrative type`);
    if (record.villageNumber !== Number(record.code?.slice(6)))
      failures.push(`${record.code}: village number mismatch`);
    const numberKey = `${record.parentTambonCode}:${record.villageNumber}`;
    if (numbersWithinTambon.has(numberKey))
      failures.push(`${record.code}: duplicate village number within tambon`);
    numbersWithinTambon.add(numberKey);

    const parent = tambonByCode.get(record.parentTambonCode);
    if (!parent) failures.push(`${record.code}: unknown parent tambon`);
    if (record.parentTambonCode !== record.code?.slice(0, 6))
      failures.push(`${record.code}: parent tambon mismatch`);
    if (record.parentAmphoeCode !== record.code?.slice(0, 4))
      failures.push(`${record.code}: parent amphoe mismatch`);
    if (record.parentProvinceCode !== `TH-${record.code?.slice(0, 2)}`)
      failures.push(`${record.code}: parent province mismatch`);
    if (
      parent &&
      (parent.parentDistrictCode !== record.parentAmphoeCode ||
        parent.parentProvinceCode !== record.parentProvinceCode)
    )
      failures.push(`${record.code}: cross-parent relationship`);
    if (!record.nameTh?.trim() || record.nameTh !== record.nameTh?.normalize("NFC"))
      failures.push(`${record.code}: invalid Thai name normalization`);
    if (record.nameEn !== "" || record.englishNameStatus !== "pending")
      failures.push(`${record.code}: English name must remain empty and pending`);
    if (record.lifecycleStatus !== "observed_current_snapshot")
      failures.push(`${record.code}: unsupported lifecycle assertion`);
    if (record.identityVerificationStatus !== "verified_authoritative_snapshot")
      failures.push(`${record.code}: identity verification status invalid`);
    if (record.rightsStatus !== "pending_explicit_redistribution_terms")
      failures.push(`${record.code}: rights status must remain pending`);
    if (record.boundaryStatus !== "pending")
      failures.push(`${record.code}: boundary status must remain pending`);
    if (record.publicationEligibility !== "blocked")
      failures.push(`${record.code}: publication must remain blocked`);
    if (record.representedAt !== "2026-07")
      failures.push(`${record.code}: represented date mismatch`);
    if (!Array.isArray(record.sourceReferences) || record.sourceReferences.length !== 2)
      failures.push(`${record.code}: source references incomplete`);
    for (const key of Object.keys(record)) {
      if (PROHIBITED_FIELDS.has(key))
        failures.push(`${record.code}: prohibited field ${key}`);
    }
    provinceCodes.add(record.parentProvinceCode);
    amphoeCodes.add(record.parentAmphoeCode);
    coveredTambons.add(record.parentTambonCode);
  }
  if (tambonByCode.size !== 7256)
    failures.push(`expected 7256 parent tambons, found ${tambonByCode.size}`);
  if (provinceCodes.size !== 76)
    failures.push(`expected 76 covered provinces, found ${provinceCodes.size}`);
  if (amphoeCodes.size !== 878)
    failures.push(`expected 878 covered amphoe, found ${amphoeCodes.size}`);
  if (coveredTambons.size !== 7111)
    failures.push(`expected 7111 tambons with villages, found ${coveredTambons.size}`);
  return failures;
}

export function validateVillageManifest(manifest) {
  const failures = [];
  if (manifest?.status !== "research_evidence_only")
    failures.push("manifest status invalid");
  if (manifest?.publicationEligibility !== "blocked")
    failures.push("manifest publication must remain blocked");
  if (manifest?.sourceRegister?.length !== 3)
    failures.push("expected three source entries");
  for (const source of manifest?.sourceRegister ?? []) {
    if (!source.sourceUrl?.startsWith("https://"))
      failures.push(`${source.reference}: HTTPS source required`);
    if (!source.publisher || !source.retrievedAt || !source.representedAt)
      failures.push(`${source.reference}: provenance incomplete`);
    if (!source.evidenceLocator) failures.push(`${source.reference}: locator missing`);
    if (source.rightsStatus !== "pending_explicit_redistribution_terms")
      failures.push(`${source.reference}: rights must remain pending`);
  }
  const march = manifest?.sourceRegister?.find(
    ({ reference }) => reference === "DOPA-VILLAGE-2026-03",
  );
  const july = manifest?.sourceRegister?.find(
    ({ reference }) => reference === "DOPA-VILLAGE-2026-07",
  );
  for (const [source, month] of [
    [march, "03"],
    [july, "07"],
  ]) {
    if (
      source?.representedAt !== `2026-${month}` ||
      source?.queryParameters?.month !== month ||
      source?.queryParameters?.year !== "69" ||
      source?.artifacts?.length !== 77 ||
      !/^[a-f0-9]{64}$/.test(source?.artifactSetSha256 ?? "") ||
      !/^[a-f0-9]{64}$/.test(source?.catalogSha256 ?? "")
    )
      failures.push(`monthly source ${month} provenance incomplete`);
    for (const artifact of source?.artifacts ?? []) {
      if (
        !/^\d{2}$/.test(artifact.provinceCode) ||
        !/^[a-f0-9]{64}$/.test(artifact.sha256)
      )
        failures.push(`${source.reference}: invalid artifact provenance`);
    }
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
    failures.push("province coverage must be 76");
  if (Object.keys(manifest?.amphoeCounts ?? {}).length !== 878)
    failures.push("amphoe coverage must be 878");
  if (Object.keys(manifest?.tambonCounts ?? {}).length !== 7256)
    failures.push("tambon matrix must cover 7256 parents");
  if (manifest?.zeroVillageTambons?.length !== 145)
    failures.push("zero-village tambon evidence must contain 145 entries");
  if (manifest?.monthlyReconciliation?.newlyObservedInJuly?.length !== 6)
    failures.push("expected six newly observed July identities");
  if (manifest?.monthlyReconciliation?.notObservedInJuly?.length !== 1)
    failures.push("expected one unresolved not-observed identity");
  if (manifest?.monthlyReconciliation?.identityConflicts?.length)
    failures.push("monthly identity conflicts must be empty");
  if (
    manifest?.monthlyReconciliation?.notObservedLifecycleStatus !==
    "unresolved_not_inferred_as_inactive_or_cancelled"
  )
    failures.push("unresolved lifecycle must remain fail-closed");
  return failures;
}

export function findVillageRuntimeLeakage(scanRoot = root) {
  const runtimeRoots = ["app", "application", "components", "public", "infrastructure"];
  const needle = "thailand-village-evidence";
  const leaks = [];
  for (const directory of runtimeRoots) {
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
  const entries = readdirSync(resolve(scanRoot, "data/research"), {
    recursive: true,
    withFileTypes: true,
  });
  return entries
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
  const payload = JSON.parse(
    readFileSync(resolve(root, "data/research/thailand-village-evidence.json"), "utf8"),
  );
  const manifest = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-village-evidence.manifest.json"),
      "utf8",
    ),
  );
  const tambons = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-subdistrict-evidence.json"),
      "utf8",
    ),
  ).records;
  const failures = [
    ...validateVillageEvidence(payload, tambons),
    ...validateVillageManifest(manifest),
    ...findVillageRuntimeLeakage().map((file) => `runtime leakage: ${file}`),
    ...findCommittedVillageSourceBinaries().map((file) => `source binary: ${file}`),
  ];
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    "Village evidence contract OK: 75652 blocked identities across 76 provinces and 878 amphoe",
  );
}
