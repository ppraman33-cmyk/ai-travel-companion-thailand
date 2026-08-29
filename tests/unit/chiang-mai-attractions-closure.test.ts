import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  loadChiangMaiAttractions,
  findChiangMaiAttractionRuntimeLeakage,
} from "../../scripts/validate-chiang-mai-attractions-evidence.mjs";
import {
  loadChiangMaiAttractionsClosure,
  validateChiangMaiAttractionsClosure,
} from "../../scripts/validate-chiang-mai-attractions-closure.mjs";

const data = loadChiangMaiAttractions(process.cwd());
const closure = loadChiangMaiAttractionsClosure(process.cwd());
const closureIds = new Set([
  "cm-attraction-5003-mae-hae-royal-project-development-centre",
]);

describe("Chiang Mai attractions final research closure", () => {
  it("validates counts, the inherited identity lock and revalidation triggers", () => {
    expect(validateChiangMaiAttractionsClosure(data, closure)).toEqual([]);
    const inherited = data.registry.records
      .filter(({ id }) => !closureIds.has(id))
      .map(({ id, nameTh }) => ({ id, nameTh }));
    expect(inherited).toHaveLength(22);
    expect(createHash("sha256").update(JSON.stringify(inherited)).digest("hex")).toBe(
      closure.inheritedIdentityLockSha256,
    );
    expect(closure.revalidationTriggers).toHaveLength(4);
  });

  it("admits only direct-supported closure records and preserves fail-closed facts", () => {
    for (const id of closureIds) {
      const record = data.registry.records.find((candidate) => candidate.id === id);
      expect(record).toMatchObject({
        coordinates: null,
        openingHoursStatus: "pending",
        admissionStatus: "pending",
        accessibilityStatus: "pending",
        rightsStatus: "facts_only_rights_pending",
        mediaRightsStatus: "not_assessed_no_media_downloaded",
        publicationEligibility: "blocked",
      });
      expect(record?.assertions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "identity", status: "supported" }),
          expect.objectContaining({
            field: "responsible_authority",
            status: "supported",
          }),
          expect.objectContaining({ field: "district_parent", status: "supported" }),
        ]),
      );
    }
  });

  it("keeps Wiang Haeng documented and the research registry out of runtime", () => {
    expect(
      data.coverage.districts
        .filter(({ coverageStatus }) => coverageStatus === "gap")
        .map(({ code }) => code),
    ).toEqual(["5020", "5021"]);
    expect(
      data.registry.records.some(({ districtCode }) => districtCode === "5021"),
    ).toBe(false);
    expect(findChiangMaiAttractionRuntimeLeakage(process.cwd())).toEqual([]);
  });
});
