import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const write = (path, value) =>
  writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`);

const registry = read("data/research/chiang-mai-restaurants-evidence.json");
const sources = read("data/research/chiang-mai-restaurants-sources.json");
const coverage = read("data/research/chiang-mai-restaurants-coverage.json");

const localSources = [
  {
    id: "THA-DUEA-RESTAURANTS-2022",
    tier: 3,
    publisher: "Tha Duea Subdistrict Administrative Organization",
    sourceType: "official_local_government_directory",
    title: "Restaurants and accommodation in Tha Duea",
    url: "https://www.thaduea.go.th/document/tourist_attraction/461",
    representedAt: "2022-10-03",
    retrievedAt: "2026-08-29",
    locator:
      "Official Tha Duea, Doi Tao local-government tourism page names four visitor-facing raft restaurants or restaurant/resort businesses.",
    rightsStatus: "facts_only_rights_pending",
    mediaRightsStatus: "not_assessed_no_media_downloaded",
  },
  {
    id: "DTAM-BAAN-SUAN-TA-SU-LOR",
    tier: 2,
    publisher: "Department of Thai Traditional and Alternative Medicine",
    sourceType: "official_health_establishment_listing",
    title: "Baan Suan Ta Su Lor",
    url: "https://wellnesscenter.dtam.moph.go.th/contentSearchDetail.php?addressID=QUQxNzUwNzUxOTcw",
    representedAt: null,
    retrievedAt: "2026-08-29",
    locator:
      "Official wellness-establishment page names the restaurant and describes Ban Huai Hom, Ban Chan subdistrict, Galyani Vadhana district; a legacy address header still says Mae Chaem and is retained as a parent-review warning.",
    rightsStatus: "facts_only_rights_pending",
    mediaRightsStatus: "not_assessed_no_media_downloaded",
  },
  {
    id: "DTAM-KHRUA-RIM-THANG",
    tier: 2,
    publisher: "Department of Thai Traditional and Alternative Medicine",
    sourceType: "official_health_establishment_listing",
    title: "Khrua Rim Thang",
    url: "https://wellnesscenter.dtam.moph.go.th/contentSearchDetail.php?addressID=QUQxNzUwMjQwNjI2",
    representedAt: null,
    retrievedAt: "2026-08-29",
    locator:
      "Official wellness-establishment page names the restaurant and describes Mae Daet Noi, Mae Daet subdistrict, Galyani Vadhana district; a legacy address header still says Mae Chaem and is retained as a parent-review warning.",
    rightsStatus: "facts_only_rights_pending",
    mediaRightsStatus: "not_assessed_no_media_downloaded",
  },
  {
    id: "BAN-CHAN-CLEAN-FOOD-2025",
    tier: 3,
    publisher: "Ban Chan Subdistrict Administrative Organization",
    sourceType: "official_local_government_activity",
    title: "2025 Clean Food Good Taste restaurant inspection",
    url: "https://www.banchan.go.th/catalog/activity/918",
    representedAt: "2025-06-24",
    retrievedAt: "2026-08-29",
    locator:
      "Official local-government report confirms restaurant and food-stall inspections in Ban Chan with Galyani Vadhana district public-health staff; it does not name the two establishments.",
    rightsStatus: "facts_only_rights_pending",
    mediaRightsStatus: "not_assessed_no_media_downloaded",
  },
];

const common = {
  nameEn: null,
  englishNameStatus: "pending",
  subdistrictCode: null,
  coordinates: null,
  retrievedAt: "2026-08-29",
  openingHoursStatus: "pending",
  priceStatus: "pending",
  menuStatus: "pending",
  accessibilityStatus: "pending",
  contactStatus: "pending",
  rightsStatus: "facts_only_rights_pending",
  mediaRightsStatus: "not_assessed_no_media_downloaded",
  publicationEligibility: "blocked",
};

const localRecords = [
  [
    "cm-restaurant-5017-ruean-phae-luk-mae-ping",
    "เรือนแพลูกแม่ปิง",
    "THA-DUEA-RESTAURANTS-2022",
  ],
  [
    "cm-restaurant-5017-ruean-phae-tharn-thip",
    "เรือนแพธารทิพย์",
    "THA-DUEA-RESTAURANTS-2022",
  ],
  [
    "cm-restaurant-5017-ruean-phae-doi-tao-rim-ping",
    "เรือนแพดอยเต่าริมปิง",
    "THA-DUEA-RESTAURANTS-2022",
  ],
  [
    "cm-restaurant-5017-check-in-doi-tao",
    "ร้าน CHECK IN DOI TAO CAFE' AND RESORT",
    "THA-DUEA-RESTAURANTS-2022",
  ],
].map(([id, nameTh, sourceId]) => ({
  ...common,
  id,
  nameTh,
  category: "local_restaurant_candidate",
  selectionFocus: "community_local_restaurant",
  districtCode: "5017",
  districtNameTh: "ดอยเต่า",
  districtNameEn: "Doi Tao",
  sourceIds: [sourceId],
  assertions: [
    { field: "identity", sourceId, status: "supported" },
    { field: "district_parent", sourceId, status: "supported" },
    {
      field: "current_operation",
      sourceId,
      status: "pending_direct_owner_reverification",
    },
  ],
  representedAt: "2022-10-03",
  freshnessStatus: "stale_reverification_required",
  evidenceStatus: "identity_and_district_supported_current_operation_pending",
  reviewNotes: [
    "The official 2022 directory supports identity and Doi Tao parent only; current operation and all visitor facts remain pending.",
  ],
}));

for (const [id, nameTh, sourceId] of [
  [
    "cm-restaurant-5025-baan-suan-ta-su-lor",
    "บ้านสวนต่าสู่หล่อ",
    "DTAM-BAAN-SUAN-TA-SU-LOR",
  ],
  ["cm-restaurant-5025-khrua-rim-thang", "ร้านครัวริมทาง", "DTAM-KHRUA-RIM-THANG"],
]) {
  localRecords.push({
    ...common,
    id,
    nameTh,
    category: "local_health_food_restaurant_candidate",
    selectionFocus: "community_local_restaurant",
    districtCode: "5025",
    districtNameTh: "กัลยาณิวัฒนา",
    districtNameEn: "Galyani Vadhana",
    sourceIds: [sourceId, "BAN-CHAN-CLEAN-FOOD-2025"],
    assertions: [
      { field: "identity", sourceId, status: "supported" },
      {
        field: "district_parent",
        sourceId,
        status: "supported_with_legacy_header_conflict",
      },
      {
        field: "current_operation",
        sourceId: "BAN-CHAN-CLEAN-FOOD-2025",
        status: "pending_direct_owner_reverification",
      },
    ],
    representedAt: null,
    freshnessStatus: "parent_metadata_conflict_and_reverification_required",
    evidenceStatus: "identity_supported_parent_legacy_conflict_review_required",
    reviewNotes: [
      "The description explicitly states Galyani Vadhana, but the page's legacy structured address says Mae Chaem; publication remains blocked pending resolution.",
    ],
  });
}

const sourceIds = new Set(sources.sources.map(({ id }) => id));
for (const source of localSources)
  if (!sourceIds.has(source.id)) sources.sources.push(source);
const recordIds = new Set(registry.records.map(({ id }) => id));
for (const record of localRecords)
  if (!recordIds.has(record.id)) registry.records.push(record);

for (const district of coverage.districts) {
  district.recordIds = registry.records
    .filter(({ districtCode }) => districtCode === district.code)
    .map(({ id }) => id);
  district.coverageStatus = district.recordIds.length ? "partial" : "research_pending";
  district.gap = district.recordIds.length
    ? `${district.recordIds.length} research record(s) admitted or quarantined; current operation and detailed visitor facts remain pending.`
    : "No named restaurant candidate passed current evidence review.";
}

write("data/research/chiang-mai-restaurants-evidence.json", registry);
write("data/research/chiang-mai-restaurants-sources.json", sources);
write("data/research/chiang-mai-restaurants-coverage.json", coverage);
