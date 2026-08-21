import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

export function validateSubdistrictEvidence(payload, districts, provinces) {
  const failures = [];
  const records = payload?.records ?? [];
  const districtByCode = new Map(districts.map((record) => [record.code, record]));
  const provinceCodes = new Set(provinces.map(({ code }) => code));
  const codes = new Set();
  const namesWithinParent = new Set();
  const parentCounts = new Map();
  let tambon = 0;
  let khwaeng = 0;

  if (payload?.status !== "research_evidence_only")
    failures.push("registry must remain research_evidence_only");
  if (payload?.publicationEligibility !== "blocked")
    failures.push("registry publication must remain blocked");
  if (records.length !== 7436)
    failures.push(`expected 7436 records, found ${records.length}`);

  for (const record of records) {
    if (!/^\d{6}$/.test(record.code)) failures.push(`${record.code}: invalid code`);
    if (codes.has(record.code)) failures.push(`${record.code}: duplicate code`);
    codes.add(record.code);
    const parent = districtByCode.get(record.parentDistrictCode);
    if (!parent) failures.push(`${record.code}: unknown parent district`);
    if (!provinceCodes.has(record.parentProvinceCode))
      failures.push(`${record.code}: unknown parent province`);
    if (record.parentDistrictCode !== record.code.slice(0, 4))
      failures.push(`${record.code}: parent district mismatch`);
    if (record.parentProvinceCode !== `TH-${record.code.slice(0, 2)}`)
      failures.push(`${record.code}: parent province mismatch`);
    if (parent && parent.parentProvinceCode !== record.parentProvinceCode)
      failures.push(`${record.code}: cross-province relationship`);
    if (record.nameTh !== record.nameTh?.normalize("NFC") || !record.nameTh?.trim())
      failures.push(`${record.code}: invalid Thai name normalization`);
    const normalizedName = `${record.parentDistrictCode}:${record.nameTh
      ?.normalize("NFC")
      .trim()
      .toLocaleLowerCase("th")}`;
    if (namesWithinParent.has(normalizedName))
      failures.push(`${record.code}: duplicate normalized name within parent`);
    namesWithinParent.add(normalizedName);
    if (record.englishNameStatus === "verified_authoritative" && !record.nameEn?.trim())
      failures.push(`${record.code}: verified English name missing`);
    if (record.englishNameStatus === "pending" && record.nameEn?.trim())
      failures.push(`${record.code}: pending English name must not be guessed`);
    if (record.lifecycleStatus !== "active")
      failures.push(`${record.code}: inactive record entered active registry`);
    if (record.rightsStatus !== "pending_explicit_redistribution_terms")
      failures.push(`${record.code}: rights status must remain pending`);
    if (record.boundaryStatus !== "pending" || "geometry" in record)
      failures.push(`${record.code}: boundary must remain pending and absent`);
    if (record.publicationEligibility !== "blocked")
      failures.push(`${record.code}: publication must remain blocked`);
    if (!Array.isArray(record.sourceReferences) || record.sourceReferences.length !== 2)
      failures.push(`${record.code}: two source references required`);

    const isBangkok = record.parentProvinceCode === "TH-10";
    if (isBangkok !== (record.administrativeType === "bangkok_khwaeng"))
      failures.push(`${record.code}: Bangkok classification mismatch`);
    if (isBangkok && !record.nameTh.startsWith("แขวง"))
      failures.push(`${record.code}: Bangkok Thai name must retain แขวง`);
    if (!isBangkok && record.administrativeType !== "tambon")
      failures.push(`${record.code}: provincial administrative type mismatch`);
    if (isBangkok) khwaeng += 1;
    else tambon += 1;
    parentCounts.set(
      record.parentDistrictCode,
      (parentCounts.get(record.parentDistrictCode) ?? 0) + 1,
    );
  }
  if (tambon !== 7256) failures.push(`expected 7256 tambon, found ${tambon}`);
  if (khwaeng !== 180) failures.push(`expected 180 khwaeng, found ${khwaeng}`);
  if (parentCounts.size !== 928)
    failures.push(`expected 928 covered parent districts, found ${parentCounts.size}`);
  return failures;
}

export function validateSubdistrictManifest(manifest) {
  const failures = [];
  if (manifest?.status !== "research_evidence_only")
    failures.push("manifest status invalid");
  if (manifest?.publicationEligibility !== "blocked")
    failures.push("manifest publication must remain blocked");
  if (manifest?.sourceRegister?.length !== 2) failures.push("expected two sources");
  for (const source of manifest?.sourceRegister ?? []) {
    if (!source.sourceUrl?.startsWith("https://"))
      failures.push(`${source.reference}: HTTPS source required`);
    if (!source.publisher || !source.retrievedAt || !source.representedAt)
      failures.push(`${source.reference}: provenance incomplete`);
    if (!/^[a-f0-9]{64}$/.test(source.sha256 ?? ""))
      failures.push(`${source.reference}: checksum missing`);
    if (!source.evidenceLocator) failures.push(`${source.reference}: locator missing`);
    if (source.rightsStatus !== "pending_explicit_redistribution_terms")
      failures.push(`${source.reference}: rights must remain pending`);
  }
  const freshness = manifest?.sourceRegister?.find(
    ({ reference }) => reference === "DOPA-POPULATION-ADM3-2026-03",
  );
  if (
    freshness?.representedAt !== "2026-03" ||
    freshness?.sourceUrl !==
      "https://stat.bora.dopa.go.th/new_stat/file/69/3_6903.xls" ||
    freshness?.catalogUrl !==
      "https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=03&year=69" ||
    freshness?.artifactPathParameters?.BuddhistYearTwoDigit !== "69" ||
    freshness?.artifactPathParameters?.administrativeLevel !== "3" ||
    freshness?.artifactPathParameters?.yearMonth !== "6903" ||
    !freshness?.evidenceLocator?.includes("year-month field 6903")
  )
    failures.push(
      "freshness source must bind represented month to exact artifact parameters",
    );
  if (Object.keys(manifest?.provinceCounts ?? {}).length !== 77)
    failures.push("province coverage must be 77");
  if (Object.keys(manifest?.parentDistrictCounts ?? {}).length !== 928)
    failures.push("parent district coverage must be 928");
  for (const key of ["missingRecords", "extraRecords"]) {
    if (manifest?.[key]?.length) failures.push(`${key} must be empty`);
  }
  return failures;
}

export function findSubdistrictRuntimeLeakage(scanRoot = root) {
  const runtimeRoots = ["app", "application", "components", "public", "infrastructure"];
  const needle = "thailand-subdistrict-evidence";
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
    resolve(root, "scripts/validate-thailand-subdistrict-evidence.mjs")
) {
  const payload = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-subdistrict-evidence.json"),
      "utf8",
    ),
  );
  const manifest = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-subdistrict-evidence.manifest.json"),
      "utf8",
    ),
  );
  const districts = JSON.parse(
    readFileSync(
      resolve(root, "data/research/thailand-district-evidence.json"),
      "utf8",
    ),
  ).records;
  const provinces = JSON.parse(
    readFileSync(resolve(root, "data/geography/thailand-provinces.geojson"), "utf8"),
  ).features.map(({ properties }) => properties);
  const failures = [
    ...validateSubdistrictEvidence(payload, districts, provinces),
    ...validateSubdistrictManifest(manifest),
    ...findSubdistrictRuntimeLeakage().map((file) => `runtime leakage: ${file}`),
  ];
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    "Subdistrict evidence contract OK: 7436 blocked identities across 928 parents",
  );
}
