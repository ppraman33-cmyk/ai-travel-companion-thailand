import { describe, expect, it } from "vitest";

import {
  loadChiangMaiRestaurantCoverage,
  validateChiangMaiRestaurantCoverage,
} from "../../scripts/validate-chiang-mai-restaurants-evidence.mjs";

const data = loadChiangMaiRestaurantCoverage(process.cwd());

describe("Chiang Mai restaurant evidence baseline", () => {
  it("locks the province-wide fail-closed research contract", () => {
    expect(validateChiangMaiRestaurantCoverage(data)).toEqual([]);
  });

  it("accounts for all districts without turning ten restaurants into a quota", () => {
    expect(data.coverage.districts).toHaveLength(25);
    expect(data.coverage.targetPerDistrict).toBe(10);
    expect(data.coverage.targetIsQuota).toBe(false);
    expect(data.coverage.publicationEligibility).toBe("blocked");
  });

  it("keeps the first municipal listings quarantined pending current owner checks", () => {
    const municipalIds = new Set([
      "cm-restaurant-5001-hello-solao",
      "cm-restaurant-5001-khum-wiang-yong",
      "cm-restaurant-5001-baan-rom-mai-bali",
    ]);
    const municipalRecords = data.registry.records.filter(({ id }) =>
      municipalIds.has(id),
    );
    expect(municipalRecords).toHaveLength(3);
    for (const record of municipalRecords) {
      expect(record).toMatchObject({
        districtCode: "5001",
        coordinates: null,
        openingHoursStatus: "pending",
        priceStatus: "pending",
        menuStatus: "pending",
        rightsStatus: "facts_only_rights_pending",
        mediaRightsStatus: "not_assessed_no_media_downloaded",
        publicationEligibility: "blocked",
      });
      expect(record.assertions).toContainEqual(
        expect.objectContaining({
          field: "current_operation",
          status: "pending_direct_owner_reverification",
        }),
      );
    }
  });

  it("keeps open-data candidates blocked and strips coordinates", () => {
    const openData = data.registry.records.filter(({ sourceIds }) =>
      sourceIds.some((sourceId) => sourceId.startsWith("OSM-")),
    );
    expect(openData.length).toBeGreaterThan(100);
    expect(
      data.coverage.districts.filter(({ recordIds }) => recordIds.length),
    ).toHaveLength(25);
    for (const record of openData) {
      expect(record).toMatchObject({
        coordinates: null,
        rightsStatus: "open_data_odbl_compliance_review_required",
        publicationEligibility: "blocked",
      });
      expect(record.assertions).toContainEqual(
        expect.objectContaining({
          field: "current_operation",
          status: "pending_direct_owner_reverification",
        }),
      );
    }
  });

  it("rejects generic, chain, non-restaurant and alias-duplicate candidates", () => {
    expect(data.registry.records).toHaveLength(175);
    const names = data.registry.records.map(({ nameTh }) => nameTh);
    expect(names).not.toEqual(
      expect.arrayContaining([
        "ตลาดตอนเย็น",
        "Noodle shop/barbeque.",
        "อาหารตามสั่ง",
        "KFC",
        "Cafe buffet",
        "สยามการ์เด้นคุ้กกิ้งสคูล",
        "Best Place",
        "อาการตามสั่ง",
      ]),
    );
    expect(validateChiangMaiRestaurantCoverage(data)).toEqual([]);
  });
});
