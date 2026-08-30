import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

export function loadChiangMaiRestaurantCoverage(scanRoot = root) {
  const read = (path) => JSON.parse(readFileSync(resolve(scanRoot, path), "utf8"));
  return {
    registry: read("data/research/chiang-mai-restaurants-evidence.json"),
    sources: read("data/research/chiang-mai-restaurants-sources.json"),
    coverage: read("data/research/chiang-mai-restaurants-coverage.json"),
    districts: read("data/research/thailand-district-evidence.json").records,
  };
}

export function validateChiangMaiRestaurantCoverage({
  registry,
  sources,
  coverage,
  districts,
}) {
  const failures = [];
  const canonical = districts.filter(
    ({ parentProvinceCode }) => parentProvinceCode === "TH-50",
  );
  const districtByCode = new Map(canonical.map((record) => [record.code, record]));
  const sourceById = new Map(sources.sources.map((source) => [source.id, source]));
  const recordById = new Map(registry.records.map((record) => [record.id, record]));
  const identityByDistrict = new Map();
  const identityKey = (value) =>
    value
      .normalize("NFC")
      .toLocaleLowerCase("th")
      .replace(/^(ร้านอาหาร|สวนอาหาร)/, "")
      .replace(/[\s&'()./-]+/g, "")
      .trim();
  const prohibitedNames = new Set([
    "อาหารตามสั่ง",
    "อาการตามสั่ง",
    "ตลาดตอนเย็น",
    "noodle shop/barbeque.",
    "cafe buffet",
    "best place",
    "kfc",
  ]);

  if (coverage.status !== "research_evidence_only")
    failures.push("restaurant coverage must remain research evidence only");
  if (coverage.publicationEligibility !== "blocked")
    failures.push("restaurant coverage publication gate relaxed");
  if (coverage.targetPerDistrict !== 10 || coverage.targetIsQuota !== false)
    failures.push("restaurant target must remain ten-per-district and non-quota");
  if (canonical.length !== 25 || coverage.districts.length !== 25)
    failures.push("restaurant matrix must account for all 25 Chiang Mai districts");
  if (new Set(coverage.districts.map(({ code }) => code)).size !== 25)
    failures.push("restaurant matrix district codes must be unique");
  for (const rootRecord of [registry, sources, coverage]) {
    if (
      rootRecord.status !== "research_evidence_only" ||
      rootRecord.publicationEligibility !== "blocked"
    )
      failures.push("restaurant research root contract relaxed");
  }

  for (const source of sources.sources) {
    if (
      !source.id ||
      ![1, 2, 3, 4, 5].includes(source.tier) ||
      !source.publisher ||
      !source.url?.startsWith("https://") ||
      !source.retrievedAt ||
      !source.locator ||
      ![
        "facts_only_rights_pending",
        "open_data_odbl_compliance_review_required",
      ].includes(source.rightsStatus) ||
      source.mediaRightsStatus !== "not_assessed_no_media_downloaded"
    )
      failures.push(`${source.id ?? "unknown source"}: invalid provenance contract`);
  }

  for (const record of registry.records) {
    const parent = districtByCode.get(record.districtCode);
    if (!record.id?.startsWith(`cm-restaurant-${record.districtCode}-`))
      failures.push(`${record.id}: unstable research id`);
    if (
      !parent ||
      parent.nameTh !== record.districtNameTh ||
      parent.nameEn !== record.districtNameEn
    )
      failures.push(`${record.id}: district parent mismatch`);
    if (record.coordinates !== null)
      failures.push(`${record.id}: unapproved coordinates imported`);
    if (prohibitedNames.has(record.nameTh.toLocaleLowerCase("th").trim()))
      failures.push(`${record.id}: prohibited generic or chain identity`);
    if (/cooking school|คุ้กกิ้งสคูล/i.test(`${record.nameTh} ${record.nameEn ?? ""}`))
      failures.push(`${record.id}: non-restaurant candidate admitted`);
    const districtIdentities = identityByDistrict.get(record.districtCode) ?? new Map();
    for (const value of [record.nameTh, record.nameEn].filter(Boolean)) {
      const key = identityKey(value);
      const existingId = districtIdentities.get(key);
      if (existingId && existingId !== record.id)
        failures.push(`${record.id}: duplicate identity alias with ${existingId}`);
      districtIdentities.set(key, record.id);
    }
    identityByDistrict.set(record.districtCode, districtIdentities);
    if (
      record.openingHoursStatus !== "pending" ||
      record.priceStatus !== "pending" ||
      record.menuStatus !== "pending" ||
      record.accessibilityStatus !== "pending" ||
      record.contactStatus !== "pending"
    )
      failures.push(`${record.id}: unsupported visitor facts imported`);
    if (
      ![
        "facts_only_rights_pending",
        "open_data_odbl_compliance_review_required",
      ].includes(record.rightsStatus) ||
      record.mediaRightsStatus !== "not_assessed_no_media_downloaded" ||
      record.publicationEligibility !== "blocked"
    )
      failures.push(`${record.id}: rights/publication gate relaxed`);
    for (const sourceId of record.sourceIds ?? []) {
      if (!sourceById.has(sourceId))
        failures.push(`${record.id}: unknown source ${sourceId}`);
    }
    for (const assertion of record.assertions ?? []) {
      if (
        !record.sourceIds.includes(assertion.sourceId) ||
        ![
          "supported",
          "supported_open_data_candidate",
          "supported_spatial_boundary",
          "supported_with_legacy_header_conflict",
          "pending_direct_owner_reverification",
        ].includes(assertion.status)
      )
        failures.push(`${record.id}: invalid assertion ${assertion.field}`);
    }
  }

  for (const district of coverage.districts) {
    const parent = districtByCode.get(district.code);
    if (
      !parent ||
      parent.nameTh !== district.nameTh ||
      parent.nameEn !== district.nameEn
    )
      failures.push(`${district.code}: canonical district identity mismatch`);
    if (!Array.isArray(district.recordIds) || district.recordIds.length > 10)
      failures.push(`${district.code}: invalid restaurant record target`);
    if (
      !["research_pending", "partial", "closed_below_target"].includes(
        district.coverageStatus,
      )
    )
      failures.push(`${district.code}: invalid coverage status`);
    if (!district.gap?.trim()) failures.push(`${district.code}: missing gap rationale`);
    for (const recordId of district.recordIds) {
      const record = recordById.get(recordId);
      if (!record || record.districtCode !== district.code)
        failures.push(`${district.code}: unknown or cross-district record ${recordId}`);
    }
  }

  if (
    new Set(coverage.districts.flatMap(({ recordIds }) => recordIds)).size !==
    registry.records.length
  )
    failures.push("restaurant matrix does not account for every record exactly once");

  return failures;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const failures = validateChiangMaiRestaurantCoverage(
    loadChiangMaiRestaurantCoverage(),
  );
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Chiang Mai restaurant coverage contract passed: 25 districts");
  }
}
