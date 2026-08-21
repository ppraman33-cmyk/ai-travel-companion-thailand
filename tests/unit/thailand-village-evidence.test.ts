import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { loadVillageEvidence } from "../../scripts/load-thailand-village-evidence.mjs";
import {
  findCommittedVillageSourceBinaries,
  findVillageRuntimeLeakage,
  validateVillageEvidence,
  validateVillageManifest,
} from "../../scripts/validate-thailand-village-evidence.mjs";

const root = process.cwd();
const loaded = loadVillageEvidence(root);
const { manifest, records, canonicalRecordsSha256 } = loaded;
const tambons = JSON.parse(
  readFileSync(
    resolve(root, "data/research/thailand-subdistrict-evidence.json"),
    "utf8",
  ),
).records;

describe("Thailand nationwide village evidence baseline", () => {
  it("reconstructs the exact reviewed 75652-record canonical semantics", () => {
    expect(records).toHaveLength(75652);
    expect(canonicalRecordsSha256).toBe(
      "c6747dbc350d9e16ab21ba05535d911625a7b3ef0823c2ae0fe81a3210b7d333",
    );
    expect(validateVillageEvidence(records, tambons)).toEqual([]);
  });

  it("uses 76 inspectable province shards below every storage threshold", () => {
    expect(manifest.storage.files).toHaveLength(76);
    expect(manifest.storage.totalBytes).toBe(3830107);
    expect(manifest.storage.maxFileBytes).toBe(193588);
    expect(manifest.storage.totalBytes).toBeLessThan(25_000_000);
    expect(
      manifest.storage.files.every(
        ({ path, bytes }: { path: string; bytes: number }) =>
          bytes < 10_000_000 && statSync(resolve(root, path)).size === bytes,
      ),
    ).toBe(true);
    expect(validateVillageManifest(manifest, root)).toEqual([]);
  });

  it("covers every provincial parent and excludes Bangkok", () => {
    expect(
      new Set(records.map(({ parentProvinceCode }) => parentProvinceCode)),
    ).toHaveLength(76);
    expect(
      new Set(records.map(({ parentAmphoeCode }) => parentAmphoeCode)),
    ).toHaveLength(878);
    expect(
      new Set(records.map(({ parentTambonCode }) => parentTambonCode)),
    ).toHaveLength(7111);
    expect(
      records.some(({ parentProvinceCode }) => parentProvinceCode === "TH-10"),
    ).toBe(false);
    expect(manifest.authoritativeTotals.parentTambon).toBe(7256);
  });

  it("keeps code, number and Village to Tambon to Amphoe to Province relationships", () => {
    expect(
      records.every(
        ({
          code,
          villageNumber,
          parentTambonCode,
          parentAmphoeCode,
          parentProvinceCode,
        }) =>
          villageNumber === Number(code.slice(6)) &&
          parentTambonCode === code.slice(0, 6) &&
          parentAmphoeCode === code.slice(0, 4) &&
          parentProvinceCode === `TH-${code.slice(0, 2)}`,
      ),
    ).toBe(true);
    expect(new Set(records.map(({ code }) => code))).toHaveLength(75652);
    expect(
      new Set(
        records.map(
          ({ parentTambonCode, villageNumber }) =>
            `${parentTambonCode}:${villageNumber}`,
        ),
      ),
    ).toHaveLength(75652);
  });

  it("accounts for zero-village parents and unresolved monthly movement", () => {
    expect(Object.keys(manifest.tambonCounts)).toHaveLength(7256);
    expect(manifest.zeroVillageTambons).toHaveLength(145);
    expect(
      Object.values(manifest.tambonCounts).filter((count) => count === 0),
    ).toHaveLength(145);
    expect(manifest.monthlyReconciliation.newlyObservedInJuly).toHaveLength(6);
    expect(manifest.monthlyReconciliation.notObservedInJuly).toHaveLength(1);
    expect(manifest.monthlyReconciliation.identityConflicts).toEqual([]);
    expect(manifest.monthlyReconciliation.notObservedLifecycleStatus).toBe(
      "unresolved_not_inferred_as_inactive_or_cancelled",
    );
  });

  it("does not guess English names or retain prohibited private/source fields", () => {
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
      records.every(({ nameTh }) => nameTh && nameTh === nameTh.normalize("NFC")),
    ).toBe(true);
    expect(
      records.every(
        (record) =>
          record.nameEn === "" &&
          record.englishNameStatus === "pending" &&
          prohibited.every((field) => !(field in record)),
      ),
    ).toBe(true);
  });

  it("keeps provenance, lifecycle, rights, boundaries and publication fail-closed", () => {
    expect(manifest.sourceRegister).toHaveLength(3);
    expect(
      records.every(
        ({
          lifecycleStatus,
          rightsStatus,
          boundaryStatus,
          publicationEligibility,
          sourceReferences,
        }) =>
          lifecycleStatus === "observed_current_snapshot" &&
          rightsStatus === "pending_explicit_redistribution_terms" &&
          boundaryStatus === "pending" &&
          publicationEligibility === "blocked" &&
          sourceReferences.length === 2,
      ),
    ).toBe(true);
  });

  it("does not leak to runtime paths or commit source binaries", () => {
    expect(findVillageRuntimeLeakage(root)).toEqual([]);
    expect(findCommittedVillageSourceBinaries(root)).toEqual([]);
  });
});
