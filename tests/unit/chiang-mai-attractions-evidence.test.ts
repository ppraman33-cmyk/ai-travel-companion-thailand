import { describe, expect, it } from "vitest";

import {
  findChiangMaiAttractionRuntimeLeakage,
  findProhibitedAttractionFiles,
  loadChiangMaiAttractions,
  validateChiangMaiAttractions,
} from "../../scripts/validate-chiang-mai-attractions-evidence.mjs";

const data = loadChiangMaiAttractions(process.cwd());

describe("Chiang Mai attractions research evidence baseline", () => {
  it("validates the complete fail-closed evidence contract", () => {
    expect(validateChiangMaiAttractions(data)).toEqual([]);
  });

  it("accounts for all 25 districts without equalizing or borrowing records", () => {
    expect(data.coverage.districts).toHaveLength(25);
    expect(data.registry.records).toHaveLength(15);
    expect(
      data.coverage.districts.filter(({ coverageStatus }) => coverageStatus === "gap"),
    ).toHaveLength(10);
    expect(
      data.coverage.districts.every(({ code, recordIds }) =>
        recordIds.every(
          (id) =>
            data.registry.records.find((record) => record.id === id)?.districtCode ===
            code,
        ),
      ),
    ).toBe(true);
  });

  it("admits only the four Batch 2 districts with direct official parent evidence", () => {
    const admitted = new Map(
      data.registry.records.map((record) => [record.districtCode, record]),
    );
    expect([...admitted.keys()]).toEqual(
      expect.arrayContaining(["5008", "5012", "5016", "5019"]),
    );
    for (const code of ["5008", "5012", "5016", "5019"]) {
      expect(admitted.get(code)?.assertions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "district_parent", status: "supported" }),
        ]),
      );
    }
  });

  it("keeps the ten unresolved districts explicit instead of equalizing coverage", () => {
    expect(
      data.coverage.districts
        .filter(({ coverageStatus }) => coverageStatus === "gap")
        .map(({ code }) => code),
    ).toEqual([
      "5003",
      "5005",
      "5010",
      "5013",
      "5014",
      "5020",
      "5021",
      "5022",
      "5023",
      "5025",
    ]);
  });

  it("keeps every record rights-pending and publication-blocked", () => {
    expect(
      data.registry.records.every(
        (record) =>
          record.rightsStatus === "facts_only_rights_pending" &&
          record.mediaRightsStatus === "not_assessed_no_media_downloaded" &&
          record.publicationEligibility === "blocked" &&
          record.coordinates === null &&
          record.openingHoursStatus === "pending" &&
          record.admissionStatus === "pending" &&
          record.accessibilityStatus === "pending",
      ),
    ).toBe(true);
  });

  it("requires assertion-level evidence and a registered source for every record", () => {
    const sourceIds = new Set(data.sources.sources.map(({ id }) => id));
    expect(
      data.registry.records.every(
        (record) =>
          record.assertions.length > 0 &&
          record.sourceIds.length > 0 &&
          record.sourceIds.every((id) => sourceIds.has(id)),
      ),
    ).toBe(true);
  });

  it("binds Doi Inthanon to Chom Thong with direct and current supporting evidence", () => {
    const record = data.registry.records.find(
      ({ id }) => id === "cm-attraction-5002-doi-inthanon-national-park",
    );
    const sources = new Map(data.sources.sources.map((source) => [source.id, source]));

    expect(record).toMatchObject({
      districtCode: "5002",
      representedAt: "2026-01-15",
      rightsStatus: "facts_only_rights_pending",
      mediaRightsStatus: "not_assessed_no_media_downloaded",
      publicationEligibility: "blocked",
      coordinates: null,
      openingHoursStatus: "pending",
      admissionStatus: "pending",
      accessibilityStatus: "pending",
    });
    expect(record?.assertions).toEqual(
      expect.arrayContaining([
        {
          field: "district_parent",
          sourceId: "TAT-CNX-DOI-INTHANON-DIRECT",
          status: "supported",
        },
        {
          field: "district_parent_supporting_current",
          sourceId: "CM-PROVINCE-NEWS-14279",
          status: "supported",
        },
      ]),
    );
    expect(sources.get("TAT-CNX-DOI-INTHANON-DIRECT")).toMatchObject({
      representedAt: null,
      retrievedAt: "2026-08-21",
    });
    expect(sources.get("CM-PROVINCE-NEWS-14279")).toMatchObject({
      representedAt: "2026-01-15",
      retrievedAt: "2026-08-21",
    });
  });

  it("does not leak research data into runtime paths or retain source binaries", () => {
    expect(findChiangMaiAttractionRuntimeLeakage(process.cwd())).toEqual([]);
    expect(findProhibitedAttractionFiles(process.cwd())).toEqual([]);
  });
});
