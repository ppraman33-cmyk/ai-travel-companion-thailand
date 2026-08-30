import { describe, expect, it } from "vitest";

import {
  loadChiangMaiRestaurantVerification,
  validateChiangMaiRestaurantVerification,
} from "../../scripts/validate-chiang-mai-restaurants-verification.mjs";

const data = loadChiangMaiRestaurantVerification(process.cwd());

describe("Chiang Mai restaurant verification", () => {
  it("accounts for every baseline record while remaining fail-closed", () => {
    expect(validateChiangMaiRestaurantVerification(data)).toEqual([]);
    expect(data.verification.summary).toEqual({
      baselineRecords: 175,
      reviewedRecords: 175,
      verifiedResearchRecords: 3,
      pendingMoreEvidence: 172,
      excludedRecords: 0,
    });
    expect(data.verification.districts).toHaveLength(25);
    expect(data.verification.publicationEligibility).toBe("blocked");
    expect(data.verification.productionImportEligibility).toBe("blocked");
  });

  it("requires direct current-operation evidence for admitted records", () => {
    const admitted = data.verification.decisions.filter(
      ({ outcome }: { outcome: string }) => outcome === "verified_research_record",
    );
    expect(admitted).toHaveLength(3);
    for (const record of admitted) {
      expect(record.checks.currentOperation).toBe(
        "supported_direct_owner_current_page",
      );
      expect(record.verificationSourceIds).toHaveLength(2);
    }
  });

  it("does not treat OSM discovery evidence as proof of current operation", () => {
    const pending = data.verification.decisions.filter(
      ({ outcome }: { outcome: string }) => outcome === "pending_more_evidence",
    );
    expect(pending).toHaveLength(172);
    expect(pending.every(({ reason }: { reason: string }) => reason.length > 0)).toBe(
      true,
    );
  });
});
