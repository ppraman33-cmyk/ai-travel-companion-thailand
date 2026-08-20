import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  findSubdistrictRuntimeLeakage,
  validateSubdistrictEvidence,
  validateSubdistrictManifest,
} from "../../scripts/validate-thailand-subdistrict-evidence.mjs";

const root = process.cwd();
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
  readFileSync(resolve(root, "data/research/thailand-district-evidence.json"), "utf8"),
).records;
const provinces = JSON.parse(
  readFileSync(resolve(root, "data/geography/thailand-provinces.geojson"), "utf8"),
).features.map(({ properties }: { properties: unknown }) => properties);

function clonePayload() {
  return structuredClone(payload);
}

describe("Thailand nationwide subdistrict evidence baseline", () => {
  it("covers 7256 tambon and 180 Bangkok khwaeng across every approved parent", () => {
    expect(validateSubdistrictEvidence(payload, districts, provinces)).toEqual([]);
    expect(payload.records).toHaveLength(7436);
    expect(
      new Set(payload.records.map(({ code }: { code: string }) => code)),
    ).toHaveLength(7436);
    expect(
      new Set(
        payload.records.map(
          ({ parentProvinceCode }: { parentProvinceCode: string }) =>
            parentProvinceCode,
        ),
      ),
    ).toHaveLength(77);
    expect(
      new Set(
        payload.records.map(
          ({ parentDistrictCode }: { parentDistrictCode: string }) =>
            parentDistrictCode,
        ),
      ),
    ).toHaveLength(928);
    expect(
      payload.records.filter(
        ({ administrativeType }: { administrativeType: string }) =>
          administrativeType === "tambon",
      ),
    ).toHaveLength(7256);
    expect(
      payload.records.filter(
        ({ administrativeType }: { administrativeType: string }) =>
          administrativeType === "bangkok_khwaeng",
      ),
    ).toHaveLength(180);
  });

  it("matches all per-province and per-district manifest totals", () => {
    const provinceCounts: Record<string, number> = {};
    const districtCounts: Record<string, number> = {};
    for (const record of payload.records) {
      provinceCounts[record.parentProvinceCode] =
        (provinceCounts[record.parentProvinceCode] ?? 0) + 1;
      districtCounts[record.parentDistrictCode] =
        (districtCounts[record.parentDistrictCode] ?? 0) + 1;
    }
    expect(Object.fromEntries(Object.entries(provinceCounts).sort())).toEqual(
      manifest.provinceCounts,
    );
    expect(Object.fromEntries(Object.entries(districtCounts).sort())).toEqual(
      manifest.parentDistrictCounts,
    );
  });

  it("keeps the Bangkok เขต to แขวง relationship explicit", () => {
    const bangkok = payload.records.filter(
      ({ parentProvinceCode }: { parentProvinceCode: string }) =>
        parentProvinceCode === "TH-10",
    );
    expect(bangkok).toHaveLength(180);
    expect(
      bangkok.every(
        ({
          administrativeType,
          nameTh,
          parentDistrictNameTh,
        }: Record<string, string>) =>
          administrativeType === "bangkok_khwaeng" &&
          nameTh.startsWith("แขวง") &&
          parentDistrictNameTh.startsWith("เขต"),
      ),
    ).toBe(true);
  });

  it("rejects unknown, orphan and cross-province parents", () => {
    const unknown = clonePayload();
    unknown.records[0].parentDistrictCode = "9999";
    expect(validateSubdistrictEvidence(unknown, districts, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("unknown parent district")]),
    );
    const crossProvince = clonePayload();
    crossProvince.records[0].parentProvinceCode = "TH-11";
    expect(validateSubdistrictEvidence(crossProvince, districts, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("parent province mismatch")]),
    );
  });

  it("rejects duplicate normalized names, guessed English and inactive records", () => {
    const duplicate = clonePayload();
    duplicate.records[1].nameTh = duplicate.records[0].nameTh;
    duplicate.records[1].parentDistrictCode = duplicate.records[0].parentDistrictCode;
    duplicate.records[1].code = `${duplicate.records[0].code.slice(0, 4)}99`;
    expect(validateSubdistrictEvidence(duplicate, districts, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("duplicate normalized name")]),
    );
    const guessed = clonePayload();
    guessed.records[0].englishNameStatus = "pending";
    guessed.records[0].nameEn = "Guessed";
    expect(validateSubdistrictEvidence(guessed, districts, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("must not be guessed")]),
    );
    const inactive = clonePayload();
    inactive.records[0].lifecycleStatus = "cancelled";
    expect(validateSubdistrictEvidence(inactive, districts, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("inactive record")]),
    );
  });

  it("keeps rights, boundaries and publication fail-closed", () => {
    expect(
      payload.records.every(
        ({
          rightsStatus,
          boundaryStatus,
          publicationEligibility,
        }: Record<string, string>) =>
          rightsStatus === "pending_explicit_redistribution_terms" &&
          boundaryStatus === "pending" &&
          publicationEligibility === "blocked",
      ),
    ).toBe(true);
    expect(payload.records.some((record: object) => "geometry" in record)).toBe(false);
  });

  it("requires complete checksum-pinned provenance and exact reconciliation", () => {
    expect(validateSubdistrictManifest(manifest)).toEqual([]);
    expect(manifest.authoritativeTotals).toEqual({
      tambon: 7256,
      bangkokKhwaeng: 180,
      combinedAdministrativeLevel3: 7436,
    });
    expect(manifest.missingRecords).toEqual([]);
    expect(manifest.extraRecords).toEqual([]);
  });

  it("does not leak into production imports, APIs, UI, public or offline assets", () => {
    expect(findSubdistrictRuntimeLeakage(root)).toEqual([]);
  });
});
