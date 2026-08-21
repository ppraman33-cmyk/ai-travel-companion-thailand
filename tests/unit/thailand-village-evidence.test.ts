import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  findCommittedVillageSourceBinaries,
  findVillageRuntimeLeakage,
  validateVillageEvidence,
  validateVillageManifest,
} from "../../scripts/validate-thailand-village-evidence.mjs";

const root = process.cwd();
const payload = JSON.parse(
  readFileSync(resolve(root, "data/research/thailand-village-evidence.json"), "utf8"),
);
const manifest = JSON.parse(
  readFileSync(
    resolve(root, "data/research/thailand-village-evidence.manifest.json"),
    "utf8",
  ),
);
const tambons = JSON.parse(
  readFileSync(
    resolve(root, "data/research/thailand-subdistrict-evidence.json"),
    "utf8",
  ),
).records;

function withFirstRecord(change: Record<string, unknown>) {
  return {
    ...payload,
    records: [{ ...payload.records[0], ...change }, ...payload.records.slice(1)],
  };
}

describe("Thailand nationwide village evidence baseline", () => {
  it("covers the authoritative current registry without inventing Bangkok villages", () => {
    expect(validateVillageEvidence(payload, tambons)).toEqual([]);
    expect(payload.records).toHaveLength(75652);
    expect(
      new Set(payload.records.map(({ code }: { code: string }) => code)),
    ).toHaveLength(75652);
    expect(
      new Set(
        payload.records.map(
          ({ parentProvinceCode }: { parentProvinceCode: string }) =>
            parentProvinceCode,
        ),
      ),
    ).toHaveLength(76);
    expect(
      new Set(
        payload.records.map(
          ({ parentAmphoeCode }: { parentAmphoeCode: string }) => parentAmphoeCode,
        ),
      ),
    ).toHaveLength(878);
    expect(
      payload.records.some(
        ({ parentProvinceCode }: { parentProvinceCode: string }) =>
          parentProvinceCode === "TH-10",
      ),
    ).toBe(false);
  });

  it("preserves authoritative codes, village numbers and the complete parent chain", () => {
    const record = payload.records[0];
    expect(record.code).toMatch(/^\d{8}$/);
    expect(record.villageNumber).toBe(Number(record.code.slice(6)));
    expect(record.parentTambonCode).toBe(record.code.slice(0, 6));
    expect(record.parentAmphoeCode).toBe(record.code.slice(0, 4));
    expect(record.parentProvinceCode).toBe(`TH-${record.code.slice(0, 2)}`);
    expect(
      validateVillageEvidence(withFirstRecord({ parentTambonCode: "999999" }), tambons),
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("unknown parent tambon")]),
    );
  });

  it("rejects duplicate village numbers and Bangkok records", () => {
    const duplicate = {
      ...payload,
      records: [
        payload.records[0],
        {
          ...payload.records[1],
          parentTambonCode: payload.records[0].parentTambonCode,
          villageNumber: payload.records[0].villageNumber,
        },
        ...payload.records.slice(2),
      ],
    };
    expect(validateVillageEvidence(duplicate, tambons)).toEqual(
      expect.arrayContaining([expect.stringContaining("duplicate village number")]),
    );
    expect(
      validateVillageEvidence(
        withFirstRecord({
          code: "10010101",
          parentTambonCode: "100101",
          parentAmphoeCode: "1001",
          parentProvinceCode: "TH-10",
        }),
        tambons,
      ),
    ).toEqual(expect.arrayContaining([expect.stringContaining("Bangkok prohibited")]));
  });

  it("keeps English names, rights, boundaries and publication fail-closed", () => {
    expect(
      payload.records.every(
        ({
          nameEn,
          englishNameStatus,
          rightsStatus,
          boundaryStatus,
          publicationEligibility,
        }: Record<string, string>) =>
          nameEn === "" &&
          englishNameStatus === "pending" &&
          rightsStatus === "pending_explicit_redistribution_terms" &&
          boundaryStatus === "pending" &&
          publicationEligibility === "blocked",
      ),
    ).toBe(true);
    expect(
      validateVillageEvidence(withFirstRecord({ nameEn: "Guessed" }), tambons),
    ).toEqual(expect.arrayContaining([expect.stringContaining("English name")]));
    expect(
      validateVillageEvidence(
        withFirstRecord({ publicationEligibility: "published" }),
        tambons,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("publication must remain blocked"),
      ]),
    );
  });

  it("contains no population, household, personal or geometry fields", () => {
    const prohibited = [
      "population",
      "demographics",
      "households",
      "houseNumber",
      "gender",
      "age",
      "nationality",
      "religion",
      "personName",
      "phone",
      "coordinates",
      "geometry",
    ];
    expect(
      payload.records.some((record: object) => prohibited.some((key) => key in record)),
    ).toBe(false);
    expect(
      validateVillageEvidence(withFirstRecord({ population: 1 }), tambons),
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("prohibited field population")]),
    );
  });

  it("pins both monthly artifact sets and leaves lifecycle disagreement unresolved", () => {
    expect(validateVillageManifest(manifest)).toEqual([]);
    expect(manifest.authoritativeTotals).toMatchObject({
      currentVillages: 75652,
      provincialProvinces: 76,
      provincialAmphoe: 878,
      parentTambon: 7256,
      tambonWithZeroVillages: 145,
      bangkokVillages: 0,
      explicitInactiveOrCancelled: 0,
    });
    expect(manifest.monthlyReconciliation.newlyObservedInJuly).toHaveLength(6);
    expect(manifest.monthlyReconciliation.notObservedInJuly).toHaveLength(1);
    expect(manifest.monthlyReconciliation.notObservedLifecycleStatus).toBe(
      "unresolved_not_inferred_as_inactive_or_cancelled",
    );
  });

  it("accounts for every tambon, including 145 source-observed zero-village parents", () => {
    expect(Object.keys(manifest.tambonCounts)).toHaveLength(7256);
    expect(manifest.zeroVillageTambons).toHaveLength(145);
    expect(
      manifest.zeroVillageTambons.every(
        ({ reason }: { reason: string }) =>
          reason === "no_numbered_village_record_in_2026_07_source",
      ),
    ).toBe(true);
    expect(
      Object.values(manifest.tambonCounts).filter((count) => count === 0),
    ).toHaveLength(145);
  });

  it("does not expose research data to runtime paths or commit source binaries", () => {
    expect(findVillageRuntimeLeakage(root)).toEqual([]);
    expect(findCommittedVillageSourceBinaries(root)).toEqual([]);
  });
});
