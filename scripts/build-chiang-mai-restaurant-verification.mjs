import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));

const registry = read("data/research/chiang-mai-restaurants-evidence.json");
const reviewedAt = "2026-08-30";

const verified = new Map([
  [
    "cm-restaurant-5001-osm-place-3287049585",
    {
      outcome: "verified_research_record",
      reason:
        "The restaurant-controlled website confirms the operating identity and a current Michelin Guide listing independently confirms the Mueang Chiang Mai parent.",
      checks: {
        identity: "supported_direct_owner",
        currentOperation: "supported_direct_owner_current_page",
        districtParent: "supported_current_independent_directory",
        ownerOperator: "supported_direct_owner_website",
      },
      verificationSourceIds: [
        "HUEN-MUAN-JAI-INSTAGRAM-2026-08-09",
        "MICHELIN-HUEN-MUAN-JAI-2026",
      ],
    },
  ],
  [
    "cm-restaurant-5013-osm-place-4686351107",
    {
      outcome: "verified_research_record",
      reason:
        "The restaurant-controlled Facebook page confirms current restaurant activity and the Tourism Authority of Thailand listing independently confirms the San Kamphaeng address.",
      checks: {
        identity: "supported_direct_owner",
        currentOperation: "supported_direct_owner_current_page",
        districtParent: "supported_current_government_tourism_directory",
        ownerOperator: "supported_direct_owner_social_page",
      },
      verificationSourceIds: [
        "MEENA-FACEBOOK-DIRECT-2026",
        "TAT-MEENA-RICE-BASED-CUISINE-2026",
      ],
    },
  ],
  [
    "cm-restaurant-5019-ginger-farm-chiang-mai-677842671",
    {
      outcome: "verified_research_record",
      reason:
        "A dated direct-owner post confirms current operation and the operator-controlled location page confirms the exact Saraphi parent and restaurant service.",
      checks: {
        identity: "supported_direct_owner",
        currentOperation: "supported_direct_owner_current_page",
        districtParent: "supported_direct_owner_location_page",
        ownerOperator: "supported_direct_owner_social_and_location_pages",
      },
      verificationSourceIds: [
        "GINGER-FARM-FACEBOOK-2026-07-29",
        "GINGER-FARM-DIRECT-LOCATION-2026",
      ],
    },
  ],
]);

const decisions = registry.records.map((record) => {
  const admitted = verified.get(record.id);
  if (admitted) return { recordId: record.id, ...admitted };

  const hasOsm = record.sourceIds.some((sourceId) => sourceId.startsWith("OSM-"));
  const hasParentConflict = record.evidenceStatus.includes("parent_legacy_conflict");
  const reason = hasParentConflict
    ? "The available official records support identity but retain a legacy district-header conflict; exact parent and current operator evidence are not sufficient for admission."
    : hasOsm
      ? "OpenStreetMap supports discovery identity and spatial placement only; no qualifying direct owner/operator evidence of current operation was admitted in this review."
      : "The official listing supports identity and district history, but its represented date is too old or absent to establish current operation without direct owner/operator reverification.";

  return {
    recordId: record.id,
    outcome: "pending_more_evidence",
    reason,
    checks: {
      identity: hasOsm ? "candidate_only" : "supported_historical_or_official",
      currentOperation: "pending_direct_owner_evidence",
      districtParent: hasParentConflict ? "conflict_review_required" : "supported",
      ownerOperator: "pending",
    },
    verificationSourceIds: [],
  };
});

const counts = decisions.reduce((result, decision) => {
  result[decision.outcome] = (result[decision.outcome] ?? 0) + 1;
  return result;
}, {});

const districtMatrix = registry.records.reduce((matrix, record) => {
  const row = matrix.get(record.districtCode) ?? {
    code: record.districtCode,
    nameTh: record.districtNameTh,
    reviewed: 0,
    verified: 0,
    pending: 0,
  };
  const decision = decisions.find(({ recordId }) => recordId === record.id);
  row.reviewed += 1;
  if (decision.outcome === "verified_research_record") row.verified += 1;
  else row.pending += 1;
  matrix.set(record.districtCode, row);
  return matrix;
}, new Map());

const output = {
  schemaVersion: 1,
  status: "research_verification_only",
  provinceCode: "TH-50",
  reviewedAt,
  publicationEligibility: "blocked",
  productionImportEligibility: "blocked",
  verificationContract: {
    openingHoursDeferred: true,
    directOwnerOperationRequired: true,
    osmAloneCannotVerifyCurrentOperation: true,
    coordinatesImported: false,
    mediaDownloaded: false,
  },
  sources: [
    {
      id: "HUEN-MUAN-JAI-INSTAGRAM-2026-08-09",
      tier: 1,
      publisher: "Huen Muan Jai",
      sourceType: "direct_owner_social_post",
      url: "https://www.instagram.com/huenmuanjai/p/Db0FHEuRaNB/",
      representedAt: "2026-08-09",
      retrievedAt: reviewedAt,
      assertions: ["identity", "current_operation", "owner_operator"],
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
    },
    {
      id: "MICHELIN-HUEN-MUAN-JAI-2026",
      tier: 3,
      publisher: "Michelin Guide",
      sourceType: "current_independent_restaurant_directory",
      url: "https://guide.michelin.com/th/th/chiang-mai-region/chiang-mai/restaurant/huen-muan-jai",
      representedAt: null,
      retrievedAt: reviewedAt,
      assertions: ["identity", "district_parent", "restaurant_category"],
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
    },
    {
      id: "MEENA-FACEBOOK-DIRECT-2026",
      tier: 1,
      publisher: "Meena Rice Based Cuisine",
      sourceType: "direct_owner_social_page",
      url: "https://www.facebook.com/meena.rice.based/",
      representedAt: null,
      retrievedAt: reviewedAt,
      assertions: ["identity", "current_operation", "owner_operator"],
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
    },
    {
      id: "TAT-MEENA-RICE-BASED-CUISINE-2026",
      tier: 2,
      publisher: "Tourism Authority of Thailand",
      sourceType: "government_tourism_restaurant_directory",
      url: "https://www.tourismthailand.org/Restaurant/meena-rice-based-cuisine",
      representedAt: null,
      retrievedAt: reviewedAt,
      assertions: ["identity", "district_parent", "restaurant_category"],
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
    },
    {
      id: "GINGER-FARM-FACEBOOK-2026-07-29",
      tier: 1,
      publisher: "Ginger Farm Chiangmai",
      sourceType: "direct_owner_social_post",
      url: "https://www.facebook.com/gingerfarmchiangmai/photos/1075975974575976/",
      representedAt: "2026-07-29",
      retrievedAt: reviewedAt,
      assertions: ["identity", "current_operation", "owner_operator"],
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
    },
    {
      id: "GINGER-FARM-DIRECT-LOCATION-2026",
      tier: 1,
      publisher: "Ginger Farm Chiangmai",
      sourceType: "direct_owner_location_page",
      url: "https://sites.google.com/view/gingerfarmchiangmai/%E0%B9%81%E0%B8%9C%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%B2%E0%B8%99",
      representedAt: null,
      retrievedAt: reviewedAt,
      assertions: ["identity", "district_parent", "restaurant_category"],
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
    },
  ],
  summary: {
    baselineRecords: registry.records.length,
    reviewedRecords: decisions.length,
    verifiedResearchRecords: counts.verified_research_record ?? 0,
    pendingMoreEvidence: counts.pending_more_evidence ?? 0,
    excludedRecords: counts.excluded ?? 0,
  },
  districts: [...districtMatrix.values()].sort((a, b) => a.code.localeCompare(b.code)),
  decisions,
  revalidationTriggers: [
    "new direct owner/operator source",
    "new dated evidence of current operation",
    "new exact district-parent evidence",
    "approved rights and freshness review",
  ],
};

writeFileSync(
  resolve(root, "data/research/chiang-mai-restaurants-verification.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
