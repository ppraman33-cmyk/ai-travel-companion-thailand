import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  findRuntimeLeakage,
  validateDistrictEvidence,
  validateSourceManifest,
} from "../../scripts/validate-thailand-district-evidence.mjs";

type DistrictRecord = {
  code: string;
  nameTh: string;
  nameEn: string;
  administrativeType: "district" | "bangkok_district";
  parentProvinceCode: string;
  parentProvinceNameTh: string;
  parentProvinceNameEn: string;
  region: string;
  sourceReference: string;
  verificationStatus: string;
  evidenceStatus: string;
  englishNameStatus: "verified_authoritative" | "pending";
  boundaryStatus: "pending";
  publicationEligibility: "blocked";
  notes: string[];
  conflicts: string[];
};

const root = process.cwd();
const payload = JSON.parse(
  readFileSync(resolve(root, "data/research/thailand-district-evidence.json"), "utf8"),
) as {
  status: string;
  publicationEligibility: string;
  boundaryStatus: string;
  records: DistrictRecord[];
};
const manifest = JSON.parse(
  readFileSync(
    resolve(root, "data/research/thailand-district-evidence.manifest.json"),
    "utf8",
  ),
) as {
  sourceRegister: unknown[];
  authoritativeTotals: Record<string, number>;
  provinceCounts: Record<string, number>;
};
const provinceCollection = JSON.parse(
  readFileSync(resolve(root, "data/geography/thailand-provinces.geojson"), "utf8"),
) as { features: Array<{ properties: { code: string } }> };
const provinces = provinceCollection.features.map(({ properties }) => properties);

function clonePayload() {
  return structuredClone(payload);
}

describe("Thailand nationwide district evidence baseline", () => {
  it("covers the authoritative 878 districts and 50 Bangkok districts across 77 parents", () => {
    expect(validateDistrictEvidence(payload, provinces)).toEqual([]);
    expect(payload.records).toHaveLength(928);
    expect(new Set(payload.records.map(({ code }) => code))).toHaveLength(928);
    expect(
      new Set(payload.records.map(({ parentProvinceCode }) => parentProvinceCode)),
    ).toHaveLength(77);
    expect(
      payload.records.filter(
        ({ administrativeType }) => administrativeType === "district",
      ),
    ).toHaveLength(878);
    expect(
      payload.records.filter(
        ({ administrativeType }) => administrativeType === "bangkok_district",
      ),
    ).toHaveLength(50);
    const recordedCounts = Object.fromEntries(
      [...new Set(payload.records.map(({ parentProvinceCode }) => parentProvinceCode))]
        .sort()
        .map((provinceCode) => [
          provinceCode,
          payload.records.filter((record) => record.parentProvinceCode === provinceCode)
            .length,
        ]),
    );
    expect(recordedCounts).toEqual(manifest.provinceCounts);
  });

  it("keeps Bangkok as เขต and never treats Pattaya as a province", () => {
    const bangkok = payload.records.filter(
      ({ parentProvinceCode }) => parentProvinceCode === "TH-10",
    );
    expect(bangkok).toHaveLength(50);
    expect(
      bangkok.every(
        ({ administrativeType, nameTh }) =>
          administrativeType === "bangkok_district" && nameTh.startsWith("เขต"),
      ),
    ).toBe(true);
    expect(
      payload.records.some(({ parentProvinceNameEn }) =>
        /pattaya/i.test(parentProvinceNameEn),
      ),
    ).toBe(false);
  });

  it("rejects unknown parents, orphaned codes and guessed pending English names", () => {
    const unknownParent = clonePayload();
    unknownParent.records[0].parentProvinceCode = "TH-XX";
    expect(validateDistrictEvidence(unknownParent, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("unknown parent")]),
    );

    const orphan = clonePayload();
    orphan.records[0].parentProvinceCode = "TH-11";
    expect(validateDistrictEvidence(orphan, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("parent province mismatch")]),
    );

    const guessed = clonePayload();
    guessed.records[0].englishNameStatus = "pending";
    guessed.records[0].nameEn = "Guessed name";
    expect(validateDistrictEvidence(guessed, provinces)).toEqual(
      expect.arrayContaining([expect.stringContaining("must not be guessed")]),
    );
  });

  it("keeps every boundary pending and every record publication blocked", () => {
    expect(
      payload.records.every(
        ({ boundaryStatus, publicationEligibility }) =>
          boundaryStatus === "pending" && publicationEligibility === "blocked",
      ),
    ).toBe(true);
    expect(payload.records.some((record) => "geometry" in record)).toBe(false);
  });

  it("requires complete HTTPS provenance, evidence locators and checksums", () => {
    expect(validateSourceManifest(manifest)).toEqual([]);
    expect(manifest.authoritativeTotals).toEqual({
      provincialDistricts: 878,
      bangkokDistricts: 50,
      combinedAdministrativeLevel2: 928,
    });
  });

  it("does not leak the research registry into runtime, public API, UI or offline assets", () => {
    expect(findRuntimeLeakage(root)).toEqual([]);
  });
});
