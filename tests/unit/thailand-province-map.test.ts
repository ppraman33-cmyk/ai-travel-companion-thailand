import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { loadThailandProvinceMap } from "@/application/geography/thailand-province-map";

const root = process.cwd();
const geoJsonPath = resolve(root, "data/geography/thailand-provinces.geojson");
const manifest = JSON.parse(
  readFileSync(
    resolve(root, "data/geography/thailand-provinces.manifest.json"),
    "utf8",
  ),
) as { normalizedSha256: string; featureCount: number };
const collection = JSON.parse(readFileSync(geoJsonPath, "utf8")) as {
  features: Array<{
    properties: { code: string; nameEn: string; nameTh: string; sourceShapeId: string };
    geometry: { type: string; coordinates: unknown };
  }>;
};

function asSourceFixture() {
  return {
    type: "FeatureCollection",
    features: collection.features.map((feature) => ({
      type: "Feature",
      properties: {
        shapeISO: feature.properties.code,
        shapeName: feature.properties.nameEn,
        shapeID: feature.properties.sourceShapeId,
      },
      geometry: structuredClone(feature.geometry),
    })),
  };
}

function runInvalidFixture(
  update: (fixture: ReturnType<typeof asSourceFixture>) => void,
) {
  const fixture = asSourceFixture();
  update(fixture);
  const directory = mkdtempSync(join(tmpdir(), "atct-invalid-map-"));
  const path = join(directory, "invalid.geojson");
  writeFileSync(path, JSON.stringify(fixture));
  return spawnSync(
    process.execPath,
    ["scripts/build-thailand-province-map.mjs", path, "--fail-fast"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
}

describe("Thailand province geography foundation", () => {
  it("contains exactly 77 uniquely mapped province-level records", () => {
    const records = loadThailandProvinceMap();
    expect(records).toHaveLength(77);
    expect(new Set(records.map(({ code }) => code))).toHaveLength(77);
    expect(new Set(records.map(({ nameEn }) => nameEn))).toHaveLength(77);
    expect(new Set(records.map(({ nameTh }) => nameTh))).toHaveLength(77);
    expect(
      records.some(({ code, nameEn }) => code === "TH-10" && nameEn === "Bangkok"),
    ).toBe(true);
    expect(records.some(({ nameEn }) => /pattaya/i.test(nameEn))).toBe(false);
  });

  it("matches the recorded normalized checksum", () => {
    const digest = createHash("sha256").update(readFileSync(geoJsonPath)).digest("hex");
    expect(manifest.featureCount).toBe(77);
    expect(digest).toBe(manifest.normalizedSha256);
  });

  it("rejects missing, duplicate and empty geometry fail-closed", () => {
    const missing = runInvalidFixture((fixture) => fixture.features.pop());
    expect(missing.status).not.toBe(0);
    expect(missing.stderr).toContain("expected 77 features");

    const duplicate = runInvalidFixture((fixture) => {
      fixture.features[1].geometry = structuredClone(fixture.features[0].geometry);
    });
    expect(duplicate.status).not.toBe(0);
    expect(duplicate.stderr).toContain("duplicate geometry");

    const empty = runInvalidFixture((fixture) => {
      fixture.features[0].geometry = { type: "Polygon", coordinates: [] };
    });
    expect(empty.status).not.toBe(0);
    expect(empty.stderr).toMatch(/empty (geometry|polygon)/);

    const selfIntersecting = runInvalidFixture((fixture) => {
      fixture.features[0].geometry = {
        type: "Polygon",
        coordinates: [
          [
            [100, 10],
            [102, 12],
            [100, 12],
            [101.5, 10],
            [100, 10],
          ],
        ],
      };
    });
    expect(selfIntersecting.status).not.toBe(0);
    expect(selfIntersecting.stderr).toMatch(
      /(self-intersecting|topologically invalid) geometry/,
    );
  });
});
