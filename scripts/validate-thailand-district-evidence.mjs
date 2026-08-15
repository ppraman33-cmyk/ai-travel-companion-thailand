import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

export function validateDistrictEvidence(payload, provinces) {
  const failures = [];
  const records = payload?.records ?? [];
  const provinceCodes = new Set(provinces.map(({ code }) => code));
  const codes = new Set();
  const namesWithinProvince = new Set();
  const parentCounts = new Map();
  let provincialDistricts = 0;
  let bangkokDistricts = 0;

  if (payload?.status !== "research_evidence_only")
    failures.push("registry must remain research_evidence_only");
  if (payload?.publicationEligibility !== "blocked")
    failures.push("registry publication must remain blocked");
  if (records.length !== 928)
    failures.push(`expected 928 records, found ${records.length}`);

  for (const record of records) {
    if (!/^\d{4}$/.test(record.code)) failures.push(`${record.code}: invalid code`);
    if (codes.has(record.code)) failures.push(`${record.code}: duplicate code`);
    codes.add(record.code);
    if (!provinceCodes.has(record.parentProvinceCode))
      failures.push(`${record.code}: unknown parent ${record.parentProvinceCode}`);
    if (record.parentProvinceCode !== `TH-${record.code.slice(0, 2)}`)
      failures.push(`${record.code}: parent province mismatch`);
    if (record.nameTh !== record.nameTh?.normalize("NFC") || !record.nameTh?.trim())
      failures.push(`${record.code}: invalid Thai name normalization`);
    const normalizedName = `${record.parentProvinceCode}:${record.nameTh
      ?.normalize("NFC")
      .trim()
      .toLocaleLowerCase("th")}`;
    if (namesWithinProvince.has(normalizedName))
      failures.push(`${record.code}: duplicate normalized Thai name within province`);
    namesWithinProvince.add(normalizedName);

    if (record.englishNameStatus === "verified_authoritative" && !record.nameEn?.trim())
      failures.push(`${record.code}: verified English name missing`);
    if (record.englishNameStatus === "pending" && record.nameEn?.trim())
      failures.push(`${record.code}: pending English name must not be guessed`);
    if (record.sourceReference !== "DOPA-CCAATT-2023-09-01")
      failures.push(`${record.code}: source reference missing`);
    if (record.boundaryStatus !== "pending" || "geometry" in record)
      failures.push(`${record.code}: boundary must remain pending and absent`);
    if (record.publicationEligibility !== "blocked")
      failures.push(`${record.code}: publication must remain blocked`);

    const isBangkok = record.parentProvinceCode === "TH-10";
    if (isBangkok !== (record.administrativeType === "bangkok_district"))
      failures.push(`${record.code}: Bangkok classification mismatch`);
    if (isBangkok && !record.nameTh.startsWith("เขต"))
      failures.push(`${record.code}: Bangkok Thai name must retain เขต`);
    if (!isBangkok && record.administrativeType !== "district")
      failures.push(`${record.code}: provincial administrative type mismatch`);
    if (isBangkok) bangkokDistricts += 1;
    else provincialDistricts += 1;
    parentCounts.set(
      record.parentProvinceCode,
      (parentCounts.get(record.parentProvinceCode) ?? 0) + 1,
    );
  }

  if (provincialDistricts !== 878)
    failures.push(`expected 878 provincial districts, found ${provincialDistricts}`);
  if (bangkokDistricts !== 50)
    failures.push(`expected 50 Bangkok districts, found ${bangkokDistricts}`);
  if (parentCounts.size !== 77)
    failures.push(`expected 77 covered parents, found ${parentCounts.size}`);
  if (
    provinceCodes.has("Pattaya") ||
    records.some(({ parentProvinceNameEn }) => /pattaya/i.test(parentProvinceNameEn))
  )
    failures.push("Pattaya must not be treated as a province");
  return failures;
}

export function validateSourceManifest(manifest) {
  const failures = [];
  if (manifest?.status !== "research_evidence_only")
    failures.push("manifest status invalid");
  if (manifest?.publicationEligibility !== "blocked")
    failures.push("manifest publication must remain blocked");
  if (manifest?.sourceRegister?.length !== 2)
    failures.push("expected two source records");
  for (const source of manifest?.sourceRegister ?? []) {
    if (!source.sourceUrl?.startsWith("https://"))
      failures.push(`${source.reference}: source URL must use HTTPS`);
    if (!source.publisher || !source.retrievedAt || !source.representedAt)
      failures.push(`${source.reference}: provenance incomplete`);
    if (!/^[a-f0-9]{64}$/.test(source.sha256 ?? ""))
      failures.push(`${source.reference}: checksum missing`);
    if (!source.evidenceLocator)
      failures.push(`${source.reference}: evidence locator missing`);
    if (source.rightsStatus !== "pending_explicit_redistribution_terms")
      failures.push(`${source.reference}: rights must remain pending`);
  }
  return failures;
}

export function findRuntimeLeakage(scanRoot = root) {
  const runtimeRoots = ["app", "application", "components", "public", "infrastructure"];
  const needle = "thailand-district-evidence";
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

if (
  process.argv[1] &&
  resolve(process.argv[1]) ===
    resolve(root, "scripts/validate-thailand-district-evidence.mjs")
) {
  const payload = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-district-evidence.json"),
      "utf8",
    ),
  );
  const manifest = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-district-evidence.manifest.json"),
      "utf8",
    ),
  );
  const provinceCollection = JSON.parse(
    readFileSync(resolve(root, "data/geography/thailand-provinces.geojson"), "utf8"),
  );
  const provinces = provinceCollection.features.map(({ properties }) => properties);
  const failures = [
    ...validateDistrictEvidence(payload, provinces),
    ...validateSourceManifest(manifest),
    ...findRuntimeLeakage().map((file) => `runtime leakage: ${file}`),
  ];
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    "District evidence contract OK: 928 blocked identities across 77 parents",
  );
}
