import { readFileSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";

const root = process.cwd();

export function loadChiangMaiAttractions(scanRoot = root) {
  const read = (path) => JSON.parse(readFileSync(resolve(scanRoot, path), "utf8"));
  return {
    registry: read("data/research/chiang-mai-attractions-evidence.json"),
    sources: read("data/research/chiang-mai-attractions-sources.json"),
    coverage: read("data/research/chiang-mai-attractions-coverage.json"),
    exclusions: read("data/research/chiang-mai-attractions-exclusions.json"),
    districts: read("data/research/thailand-district-evidence.json").records,
    subdistricts: read("data/research/thailand-subdistrict-evidence.json").records,
  };
}

export function validateChiangMaiAttractions(data) {
  const failures = [];
  const { registry, sources, coverage, exclusions, districts, subdistricts } = data;
  const cmDistricts = districts.filter(
    ({ parentProvinceCode }) => parentProvinceCode === "TH-50",
  );
  const districtByCode = new Map(cmDistricts.map((record) => [record.code, record]));
  const subdistrictByCode = new Map(
    subdistricts
      .filter(({ parentProvinceCode }) => parentProvinceCode === "TH-50")
      .map((record) => [record.code, record]),
  );
  const sourceById = new Map(sources.sources.map((source) => [source.id, source]));
  const ids = new Set();

  if (cmDistricts.length !== 25)
    failures.push(`expected 25 Chiang Mai districts, found ${cmDistricts.length}`);
  if (coverage.districts.length !== 25)
    failures.push(`coverage matrix must contain 25 districts`);
  if (new Set(coverage.districts.map(({ code }) => code)).size !== 25)
    failures.push("coverage district codes must be unique");
  if (registry.records.length !== 11)
    failures.push(`expected 11 admitted records, found ${registry.records.length}`);

  for (const rootRecord of [registry, sources, coverage, exclusions]) {
    if (
      rootRecord.status !== "research_evidence_only" ||
      rootRecord.publicationEligibility === "eligible"
    )
      failures.push("research root contract relaxed");
  }
  if (
    sources.publicationEligibility !== "blocked" ||
    sources.rightsStatus !== "pending_explicit_redistribution_terms"
  )
    failures.push("source register rights/publication gate relaxed");

  for (const source of sources.sources) {
    if (
      !source.id ||
      ![1, 2, 3, 4, 5].includes(source.tier) ||
      !source.publisher ||
      !source.url?.startsWith("https://") ||
      !source.retrievedAt ||
      !source.locator ||
      source.rightsStatus !== "facts_only_rights_pending" ||
      source.mediaRightsStatus !== "not_assessed_no_media_downloaded"
    )
      failures.push(
        `${source.id ?? "unknown source"}: invalid source/provenance contract`,
      );
  }

  for (const record of registry.records) {
    if (!record.id?.startsWith(`cm-attraction-${record.districtCode}-`))
      failures.push(`${record.id}: unstable research id`);
    if (ids.has(record.id)) failures.push(`${record.id}: duplicate id`);
    ids.add(record.id);
    const parent = districtByCode.get(record.districtCode);
    if (
      !parent ||
      parent.nameTh !== record.districtNameTh ||
      parent.nameEn !== record.districtNameEn
    )
      failures.push(`${record.id}: district parent mismatch`);
    if (record.subdistrictCode) {
      const subdistrict = subdistrictByCode.get(record.subdistrictCode);
      if (
        !subdistrict ||
        subdistrict.parentDistrictCode !== record.districtCode ||
        subdistrict.nameTh !== record.subdistrictNameTh ||
        subdistrict.nameEn !== record.subdistrictNameEn
      )
        failures.push(`${record.id}: subdistrict parent mismatch`);
    } else if (record.subdistrictNameTh || record.subdistrictNameEn) {
      failures.push(`${record.id}: subdistrict names without code`);
    }
    if (!record.nameTh?.trim() || record.nameTh !== record.nameTh.normalize("NFC"))
      failures.push(`${record.id}: invalid Thai name`);
    if (record.nameEn === null && record.englishNameStatus !== "pending")
      failures.push(`${record.id}: missing English name not pending`);
    if (record.nameEn !== null && !record.englishNameStatus?.startsWith("verified_"))
      failures.push(`${record.id}: English name is not verified`);
    if (record.coordinates !== null || record.mapStatus !== "pending_no_coordinates")
      failures.push(`${record.id}: unverified coordinates/map state`);
    if (
      record.openingHoursStatus !== "pending" ||
      record.admissionStatus !== "pending" ||
      record.accessibilityStatus !== "pending"
    )
      failures.push(`${record.id}: unsupported visitor facts`);
    if (
      record.rightsStatus !== "facts_only_rights_pending" ||
      record.mediaRightsStatus !== "not_assessed_no_media_downloaded" ||
      record.publicationEligibility !== "blocked"
    )
      failures.push(`${record.id}: rights/publication gate relaxed`);
    if (!record.retrievedAt || !record.freshnessStatus || !record.reviewNotes?.length)
      failures.push(`${record.id}: missing review/freshness evidence`);
    if (!record.sourceIds?.length || !record.assertions?.length)
      failures.push(`${record.id}: missing assertion-level evidence`);
    for (const sourceId of record.sourceIds ?? []) {
      if (!sourceById.has(sourceId))
        failures.push(`${record.id}: unknown source ${sourceId}`);
    }
    for (const assertion of record.assertions ?? []) {
      if (
        !record.sourceIds.includes(assertion.sourceId) ||
        !["supported", "pending_primary_locator"].includes(assertion.status)
      )
        failures.push(`${record.id}: invalid assertion ${assertion.field}`);
    }
  }

  for (const district of coverage.districts) {
    const canonical = districtByCode.get(district.code);
    if (
      !canonical ||
      canonical.nameTh !== district.nameTh ||
      canonical.nameEn !== district.nameEn
    )
      failures.push(`${district.code}: coverage identity mismatch`);
    if (!district.gap?.trim()) failures.push(`${district.code}: missing coverage gap`);
    if (!district.recordIds.every((id) => ids.has(id)))
      failures.push(`${district.code}: unknown coverage record`);
    if (
      !district.recordIds.every(
        (id) =>
          registry.records.find((record) => record.id === id)?.districtCode ===
          district.code,
      )
    )
      failures.push(`${district.code}: borrowed cross-district record`);
    if (district.recordIds.length === 0 && district.coverageStatus !== "gap")
      failures.push(`${district.code}: empty district must be a gap`);
    if (district.recordIds.length > 0 && district.coverageStatus !== "partial")
      failures.push(`${district.code}: admitted records must remain partial coverage`);
  }
  if (
    new Set(coverage.districts.flatMap(({ recordIds }) => recordIds)).size !== ids.size
  )
    failures.push("coverage matrix does not account for every record exactly once");
  if (
    exclusions.items.some(
      ({ districtCode, reason }) =>
        !districtByCode.has(districtCode) || !reason?.trim(),
    )
  )
    failures.push("invalid exclusion record");
  return failures;
}

export function findChiangMaiAttractionRuntimeLeakage(scanRoot = root) {
  const roots = ["app", "application", "components", "public", "infrastructure"];
  const needles = [
    "chiang-mai-attractions-evidence",
    "chiang-mai-attractions-sources",
    "chiang-mai-attractions-coverage",
  ];
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
      const content = readFileSync(file, "utf8");
      if (needles.some((needle) => content.includes(needle))) leaks.push(file);
    }
  }
  return leaks;
}

export function findProhibitedAttractionFiles(scanRoot = root) {
  const allowed = new Set([".json", ".md", ".mjs", ".mts", ".ts"]);
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
    resolve(root, "scripts/validate-chiang-mai-attractions-evidence.mjs")
) {
  const failures = [
    ...validateChiangMaiAttractions(loadChiangMaiAttractions(root)),
    ...findChiangMaiAttractionRuntimeLeakage(root).map(
      (file) => `runtime leakage: ${file}`,
    ),
    ...findProhibitedAttractionFiles(root).map(
      (file) => `prohibited research binary: ${file}`,
    ),
  ];
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    "Chiang Mai attraction evidence OK: 11 records, 25/25 districts, publication blocked",
  );
}
