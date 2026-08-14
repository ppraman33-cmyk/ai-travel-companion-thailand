import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import booleanValid from "@turf/boolean-valid";
import polygonSelfIntersections from "geojson-polygon-self-intersections";

const SOURCE_PATH = process.argv[2];
if (!SOURCE_PATH)
  throw new Error(
    "Usage: node scripts/build-thailand-province-map.mjs <source.geojson>",
  );

const root = process.cwd();
const seed = readFileSync(resolve(root, "supabase/nationwide-draft-seed.sql"), "utf8");
const sourceBytes = readFileSync(resolve(SOURCE_PATH));
const source = JSON.parse(sourceBytes.toString("utf8"));
const rowPattern =
  /\('(?<code>TH-\d{2})','(?<thai>[^']+)','(?<english>[^']+)','(?<slug>[^']+)','(?<region>[^']+)'/g;
const registry = new Map(
  [...seed.matchAll(rowPattern)].map(({ groups }) => [groups.code, groups]),
);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const failures = [];
const seenGeometry = new Set();
const bounds = [Infinity, Infinity, -Infinity, -Infinity];

function validateRing(ring, code) {
  if (!Array.isArray(ring) || ring.length < 4)
    failures.push(`${code}: ring has fewer than four positions`);
  if (JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1)))
    failures.push(`${code}: ring is not closed`);
  let twiceArea = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const position = ring[index];
    if (
      !Array.isArray(position) ||
      position.length < 2 ||
      !position.slice(0, 2).every(Number.isFinite)
    ) {
      failures.push(`${code}: invalid coordinate`);
      continue;
    }
    const [longitude, latitude] = position;
    if (longitude < 96 || longitude > 107 || latitude < 4 || latitude > 22) {
      failures.push(`${code}: coordinate outside Thailand validation envelope`);
    }
    bounds[0] = Math.min(bounds[0], longitude);
    bounds[1] = Math.min(bounds[1], latitude);
    bounds[2] = Math.max(bounds[2], longitude);
    bounds[3] = Math.max(bounds[3], latitude);
    if (index > 0) {
      const [previousLongitude, previousLatitude] = ring[index - 1];
      twiceArea += previousLongitude * latitude - longitude * previousLatitude;
    }
  }
  if (Math.abs(twiceArea) < 1e-10) failures.push(`${code}: zero-area ring`);
}

function validateGeometry(geometry, code) {
  if (!geometry || !["Polygon", "MultiPolygon"].includes(geometry.type)) {
    failures.push(`${code}: geometry must be Polygon or MultiPolygon`);
    return;
  }
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  if (!polygons.length) failures.push(`${code}: empty geometry`);
  for (const polygon of polygons) {
    if (!Array.isArray(polygon) || !polygon.length)
      failures.push(`${code}: empty polygon`);
    for (const ring of polygon) validateRing(ring, code);
    const intersections = polygonSelfIntersections({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: polygon },
    });
    if (intersections.geometry.coordinates.length)
      failures.push(`${code}: self-intersecting geometry`);
  }
  const fingerprint = sha256(JSON.stringify(geometry));
  if (seenGeometry.has(fingerprint)) failures.push(`${code}: duplicate geometry`);
  seenGeometry.add(fingerprint);
  if (!booleanValid({ type: "Feature", properties: {}, geometry }))
    failures.push(`${code}: topologically invalid geometry`);
}

if (source.type !== "FeatureCollection")
  failures.push("source: expected FeatureCollection");
if (source.features?.length !== 77)
  failures.push(`source: expected 77 features, found ${source.features?.length ?? 0}`);
if (registry.size !== 77)
  failures.push(`registry: expected 77 records, found ${registry.size}`);

const normalizedFeatures = (source.features ?? []).map((feature) => {
  const code = feature.properties?.shapeISO;
  const record = registry.get(code);
  if (!record)
    failures.push(`${code ?? "missing-code"}: no authoritative registry mapping`);
  validateGeometry(feature.geometry, code ?? "missing-code");
  return {
    type: "Feature",
    properties: {
      code,
      nameEn: record?.english ?? "",
      nameTh: record?.thai ?? "",
      slug: record?.slug ?? "",
      region: record?.region ?? "",
      sourceShapeId: feature.properties?.shapeID ?? "",
    },
    geometry: feature.geometry,
  };
});

const codes = normalizedFeatures.map(({ properties }) => properties.code);
const englishNames = normalizedFeatures.map(({ properties }) => properties.nameEn);
const thaiNames = normalizedFeatures.map(({ properties }) => properties.nameTh);
for (const [label, values] of [
  ["codes", codes],
  ["English names", englishNames],
  ["Thai names", thaiNames],
]) {
  if (values.some((value) => !value)) failures.push(`${label}: empty value`);
  if (new Set(values).size !== 77) failures.push(`${label}: expected 77 unique values`);
}
if (!codes.includes("TH-10")) failures.push("Bangkok TH-10 is missing");
if (englishNames.some((name) => /pattaya/i.test(name)))
  failures.push("Pattaya must not be a province record");
for (const code of registry.keys())
  if (!codes.includes(code)) failures.push(`${code}: missing source feature`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

normalizedFeatures.sort((left, right) =>
  left.properties.code.localeCompare(right.properties.code),
);
const normalized = {
  type: "FeatureCollection",
  name: "Thailand provinces — geoBoundaries gbOpen ADM1",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: normalizedFeatures,
};
const normalizedText = `${JSON.stringify(normalized)}\n`;
const outputPath = resolve(root, "data/geography/thailand-provinces.geojson");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, normalizedText);

const manifest = {
  dataset: "geoBoundaries gbOpen Thailand ADM1",
  publisher: "William & Mary geoLab / geoBoundaries",
  sourceOwner: "OpenStreetMap contributors; boundary extraction credited to Wambacher",
  sourceUrl: "https://www.geoboundaries.org/api/current/gbOpen/THA/ADM1/",
  geometryUrl:
    "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/THA/ADM1/geoBoundaries-THA-ADM1.geojson",
  pinnedRevision: "9469f09",
  representedYear: "2017",
  sourceUpdated: "2023-01-19",
  retrievedAt: new Date().toISOString().slice(0, 10),
  crs: "WGS84 / OGC:CRS84 (longitude, latitude)",
  license: "Open Data Commons Open Database License 1.0 (ODbL-1.0)",
  licenseUrl: "https://opendatacommons.org/licenses/odbl/1-0/",
  attribution:
    "© OpenStreetMap contributors; boundary data via geoBoundaries (William & Mary geoLab), ODbL 1.0",
  sourceSha256: sha256(sourceBytes),
  normalizedSha256: sha256(normalizedText),
  featureCount: normalizedFeatures.length,
  bounds,
  validation: {
    uniqueCodes: 77,
    uniqueEnglishNames: 77,
    uniqueThaiNames: 77,
    bangkokIncluded: true,
    pattayaExcluded: true,
    geometryTypes: [
      ...new Set(normalizedFeatures.map(({ geometry }) => geometry.type)),
    ].sort(),
    structuralGeometryValidation:
      "passed: Turf topological validity, no polygon self-intersections, non-empty closed rings, non-zero ring area, finite coordinates, Thailand envelope, unique geometry",
  },
};
writeFileSync(
  resolve(root, "data/geography/thailand-provinces.manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
const reportRows = normalizedFeatures.map(
  ({ properties }) =>
    `| ${properties.code} | ${properties.nameEn} | ${properties.nameTh} | ${properties.region} | PASS |`,
);
const report = `# Thailand 77-Province Geometry Validation\n\nGenerated from the pinned full-resolution source. Any failed invariant aborts generation before these files are written.\n\n- Result: **PASS**\n- Records: **77** (76 provinces plus Bangkok)\n- Pattaya province records: **0**\n- CRS: WGS84 / OGC:CRS84\n- Source SHA-256: \`${manifest.sourceSha256}\`\n- Normalized SHA-256: \`${manifest.normalizedSha256}\`\n- Geometry checks: Polygon/MultiPolygon only; Turf topological validity; no polygon self-intersections; non-empty closed rings; non-zero area; finite coordinates; Thailand envelope; no duplicate geometries\n\n| Code | English | Thai | Region | Result |\n| --- | --- | --- | --- | --- |\n${reportRows.join("\n")}\n`;
mkdirSync(resolve(root, "docs/geography"), { recursive: true });
writeFileSync(
  resolve(root, "docs/geography/Thailand_77_Province_Validation.md"),
  report,
);
console.log(JSON.stringify(manifest, null, 2));
