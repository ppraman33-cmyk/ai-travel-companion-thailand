import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface ProvinceMapRecord {
  readonly code: string;
  readonly nameEn: string;
  readonly nameTh: string;
  readonly slug: string;
  readonly region: string;
  readonly path: string;
}

interface PositionFeature {
  readonly properties: Omit<ProvinceMapRecord, "path"> & {
    readonly sourceShapeId: string;
  };
  readonly geometry: {
    readonly type: "Polygon" | "MultiPolygon";
    readonly coordinates: number[][][] | number[][][][];
  };
}

const WIDTH = 620;
const HEIGHT = 900;
const BOUNDS = [97.3438072, 5.612851, 105.636812, 20.4648337] as const;

function project([longitude, latitude]: readonly number[]) {
  const x = ((longitude - BOUNDS[0]) / (BOUNDS[2] - BOUNDS[0])) * WIDTH;
  const y = HEIGHT - ((latitude - BOUNDS[1]) / (BOUNDS[3] - BOUNDS[1])) * HEIGHT;
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

function polygonPath(polygon: readonly (readonly (readonly number[])[])[]) {
  return polygon.map((ring) => `M${ring.map(project).join("L")}Z`).join("");
}

export function loadThailandProvinceMap(): readonly ProvinceMapRecord[] {
  const collection = JSON.parse(
    readFileSync(
      resolve(process.cwd(), "data/geography/thailand-provinces.geojson"),
      "utf8",
    ),
  ) as { readonly features: readonly PositionFeature[] };
  return collection.features.map(({ properties, geometry }) => ({
    code: properties.code,
    nameEn: properties.nameEn,
    nameTh: properties.nameTh,
    slug: properties.slug,
    region: properties.region,
    path:
      geometry.type === "Polygon"
        ? polygonPath(geometry.coordinates as number[][][])
        : (geometry.coordinates as number[][][][]).map(polygonPath).join(""),
  }));
}

export function findProvinceBySlug(region: string, slug: string) {
  return loadThailandProvinceMap().find(
    (province) => province.region === region && province.slug === slug,
  );
}

export const THAILAND_MAP_VIEW_BOX = `0 0 ${WIDTH} ${HEIGHT}`;
