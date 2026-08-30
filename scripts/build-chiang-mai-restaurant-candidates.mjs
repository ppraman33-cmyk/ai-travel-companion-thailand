import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";

const root = process.cwd();
const retrievalDate = new Date().toISOString().slice(0, 10);
const userAgent = "AI-Travel-Companion-Thailand research contact via GitHub repository";
const delay = (milliseconds) =>
  new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

const read = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const write = (path, value) =>
  writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`);

const districts = read("data/research/thailand-district-evidence.json").records.filter(
  ({ parentProvinceCode }) => parentProvinceCode === "TH-50",
);
const existingRegistry = read("data/research/chiang-mai-restaurants-evidence.json");
const existingSources = read("data/research/chiang-mai-restaurants-sources.json");
const coverage = read("data/research/chiang-mai-restaurants-coverage.json");

function slugify(value) {
  const ascii = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || "osm-place";
}

function normalizedName(value) {
  return value.normalize("NFC").toLocaleLowerCase("th").replace(/\s+/g, " ").trim();
}

function identityKey(value) {
  return normalizedName(value)
    .replace(/^(ร้านอาหาร|สวนอาหาร)/, "")
    .replace(/[\s&'()./-]+/g, "")
    .trim();
}

function identityKeys(...values) {
  return new Set(values.filter(Boolean).map(identityKey).filter(Boolean));
}

function isGenericName(value) {
  return [
    "restaurant",
    "food & drinks",
    "food and drinks",
    "ร้านอาหาร",
    "ร้านขายอาหาร",
    "ศูนย์อาหาร",
    "thai restaurant",
    "thai food restaurant",
    "local noodle restaurant",
    "ร้านอาหารตามสั่ง",
    "อาหารตามสั่ง",
    "อาการตามสั่ง",
    "ร้านอาหารปักษ์ใต้",
    "thai cafe",
    "ตลาดตอนเย็น",
    "noodle shop/barbeque.",
    "cafe buffet",
    "best place",
  ].includes(normalizedName(value));
}

function isOutOfFocus(element) {
  const name = normalizedName(element.tags?.name ?? "");
  const cuisine = element.tags?.cuisine?.toLowerCase() ?? "";
  return (
    /(pizza|german|japanese|korean|indian|french|italian|western)/.test(cuisine) ||
    /(pizza|german|minigolf|steakhouse|cooking school|คุ้กกิ้งสคูล)/.test(name) ||
    name === "kfc"
  );
}

function candidateScore(element) {
  const tags = element.tags ?? {};
  const cuisine = tags.cuisine?.toLowerCase() ?? "";
  let score = 0;
  if (/[ก-๙]/u.test(tags.name ?? "")) score += 4;
  if (/(thai|local|northern|noodle|khao_soi|isan)/.test(cuisine)) score += 6;
  if (element.tags.amenity === "fast_food") score += 2;
  if (tags.website || tags["contact:website"] || tags["contact:facebook"]) score += 3;
  if (element.timestamp)
    score += new Date(element.timestamp).getUTCFullYear() >= 2024 ? 2 : 0;
  return score;
}

function classify(element) {
  const cuisine = element.tags?.cuisine?.toLowerCase() ?? "";
  if (element.tags?.amenity === "fast_food") return "street_food_candidate";
  if (/(thai|local|northern|noodle|khao_soi|isan)/.test(cuisine))
    return "local_food_candidate";
  return "community_restaurant_candidate";
}

async function getDistrictBoundary(district) {
  const query = `อำเภอ${district.nameTh}, จังหวัดเชียงใหม่, ประเทศไทย`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "5",
    polygon_geojson: "1",
  });
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok)
    throw new Error(`Nominatim ${response.status} for ${district.code}`);
  const candidates = await response.json();
  const boundary = candidates.find(
    ({ osm_type: osmType, type, geojson }) =>
      osmType === "relation" &&
      type === "administrative" &&
      ["Polygon", "MultiPolygon"].includes(geojson?.type),
  );
  if (!boundary) throw new Error(`No administrative boundary for ${district.code}`);
  return boundary.geojson;
}

async function getProvinceRestaurants() {
  const query = `[out:json][timeout:180];area["ISO3166-2"="TH-50"]->.province;nwr(area.province)["amenity"~"^(restaurant|fast_food|food_court)$"]["name"];out center meta qt;`;
  const url = new URL("https://overpass-api.de/api/interpreter");
  url.search = new URLSearchParams({ data: query });
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`Overpass ${response.status}`);
  return (await response.json()).elements;
}

function elementPoint(element) {
  const longitude = element.lon ?? element.center?.lon;
  const latitude = element.lat ?? element.center?.lat;
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? point([longitude, latitude])
    : null;
}

const boundaries = new Map();
for (const district of districts) {
  boundaries.set(district.code, await getDistrictBoundary(district));
  await delay(1100);
}

const elements = await getProvinceRestaurants();
const existingNamesByDistrict = new Map();
for (const record of existingRegistry.records) {
  if (record.sourceIds?.some((sourceId) => sourceId.startsWith("OSM-"))) continue;
  const names = existingNamesByDistrict.get(record.districtCode) ?? new Set();
  for (const key of identityKeys(record.nameTh, record.nameEn)) names.add(key);
  existingNamesByDistrict.set(record.districtCode, names);
}

const generatedRecords = [];
const generatedSources = [];
for (const district of districts) {
  const boundary = boundaries.get(district.code);
  const seen = new Set(existingNamesByDistrict.get(district.code) ?? []);
  const capacity = Math.max(
    0,
    10 -
      existingRegistry.records.filter(
        ({ districtCode }) => districtCode === district.code,
      ).length,
  );
  const selected = elements
    .filter((element) => {
      const candidatePoint = elementPoint(element);
      return candidatePoint && booleanPointInPolygon(candidatePoint, boundary);
    })
    .filter(
      (element) =>
        element.tags?.name &&
        !isGenericName(element.tags.name) &&
        !isOutOfFocus(element),
    )
    .sort((left, right) => candidateScore(right) - candidateScore(left))
    .filter(({ tags }) => {
      const keys = identityKeys(tags.name, tags["name:en"]);
      if ([...keys].some((key) => seen.has(key))) return false;
      for (const key of keys) seen.add(key);
      return true;
    })
    .slice(0, capacity);

  for (const element of selected) {
    const name = element.tags.name.normalize("NFC").trim();
    const sourceId = `OSM-${element.type.toUpperCase()}-${element.id}`;
    const elementUrl = `https://www.openstreetmap.org/${element.type}/${element.id}`;
    const recordId = `cm-restaurant-${district.code}-${slugify(name)}-${element.id}`;
    generatedSources.push({
      id: sourceId,
      tier: 5,
      publisher: "OpenStreetMap contributors",
      sourceType: "open_collaborative_map_candidate",
      title: `${name} OpenStreetMap element`,
      url: elementUrl,
      representedAt: element.timestamp?.slice(0, 10) ?? null,
      retrievedAt: retrievalDate,
      locator: `Named ${element.tags.amenity} element spatially contained by the canonical ${district.nameTh} administrative boundary during candidate generation; direct-owner verification remains pending.`,
      rightsStatus: "open_data_odbl_compliance_review_required",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
    });
    generatedRecords.push({
      id: recordId,
      nameTh: name,
      nameEn: element.tags["name:en"] ?? null,
      englishNameStatus: element.tags["name:en"] ? "verified_open_data_tag" : "pending",
      category:
        element.tags.amenity === "fast_food"
          ? "street_food_or_fast_food_candidate"
          : "restaurant_candidate",
      selectionFocus: classify(element),
      districtCode: district.code,
      districtNameTh: district.nameTh,
      districtNameEn: district.nameEn,
      subdistrictCode: null,
      coordinates: null,
      sourceIds: [sourceId],
      assertions: [
        { field: "identity", sourceId, status: "supported_open_data_candidate" },
        { field: "district_parent", sourceId, status: "supported_spatial_boundary" },
        {
          field: "current_operation",
          sourceId,
          status: "pending_direct_owner_reverification",
        },
      ],
      representedAt: element.timestamp?.slice(0, 10) ?? null,
      retrievedAt: retrievalDate,
      openingHoursStatus: "pending",
      priceStatus: "pending",
      menuStatus: "pending",
      accessibilityStatus: "pending",
      contactStatus: "pending",
      freshnessStatus: "direct_owner_reverification_required",
      rightsStatus: "open_data_odbl_compliance_review_required",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
      evidenceStatus: "open_data_candidate_identity_and_district_supported",
      publicationEligibility: "blocked",
      reviewNotes: [
        "OpenStreetMap supplies candidate identity and boundary placement only; operation, owner, category focus and all visitor facts require independent verification.",
      ],
    });
  }
}

const generatedIds = new Set(generatedRecords.map(({ id }) => id));
const registry = {
  ...existingRegistry,
  records: [
    ...existingRegistry.records.filter(
      ({ sourceIds }) => !sourceIds?.some((sourceId) => sourceId.startsWith("OSM-")),
    ),
    ...generatedRecords,
  ],
};
const sourceRegister = {
  ...existingSources,
  retrievedAt: retrievalDate,
  sources: [
    ...existingSources.sources.filter(({ id }) => !id.startsWith("OSM-")),
    ...generatedSources,
  ],
};

for (const district of coverage.districts) {
  const ids = registry.records
    .filter(({ districtCode }) => districtCode === district.code)
    .map(({ id }) => id);
  district.recordIds = ids;
  district.coverageStatus = ids.length ? "partial" : "research_pending";
  district.gap = ids.length
    ? `${ids.length} research record(s) identified; OpenStreetMap-derived candidates require direct-owner verification and the district remains below or at the non-quota target of 10.`
    : "No named restaurant candidate passed the current open-data discovery query; local-source research remains pending.";
}

write("data/research/chiang-mai-restaurants-evidence.json", registry);
write("data/research/chiang-mai-restaurants-sources.json", sourceRegister);
write("data/research/chiang-mai-restaurants-coverage.json", coverage);

console.log(
  JSON.stringify(
    {
      generatedRecords: generatedRecords.length,
      totalRecords: registry.records.length,
      districtsWithRecords: coverage.districts.filter(
        ({ recordIds }) => recordIds.length,
      ).length,
      generatedSourceIds: generatedIds.size,
    },
    null,
    2,
  ),
);
