import { describe, expect, it } from "vitest";

import { ContentOperationsService } from "@/application/content/content-operations-service";
import { PublicationEligibilityService } from "@/application/content/publication-eligibility";
import type { ContentRecord } from "@/application/content/types";
import { InMemoryContentOperationsRepository } from "@/tests/fakes/in-memory-content-repository";

const eligiblePlace: ContentRecord = {
  id: "synthetic-contract-record",
  kind: "place",
  status: "approved",
  dataClassification: "real",
  canonicalThaiName: "สถานที่ทดสอบ",
  destinationActive: true,
  travelerTranslationApproved: true,
  approvedSourceCount: 1,
  verifiedAssertionCount: 1,
  verificationComplete: true,
  staleAt: "2099-01-01T00:00:00Z",
  suppressed: false,
  mediaRightsValid: true,
};

const actor = { id: "synthetic-founder", role: "founder" as const };

describe("ContentOperationsService", () => {
  it("publishes only eligible approved records and writes an audit", async () => {
    const repository = new InMemoryContentOperationsRepository([eligiblePlace]);
    const service = new ContentOperationsService(
      repository,
      new PublicationEligibilityService(),
      () => "synthetic-correlation",
    );

    const result = await service.transition(
      actor,
      "place",
      eligiblePlace.id,
      "published",
    );

    expect(result.ok && result.value.status).toBe("published");
    expect(repository.audits).toHaveLength(1);
    expect(repository.audits[0]?.action).toBe("content.published");
  });

  it("always blocks synthetic publication", async () => {
    const synthetic = { ...eligiblePlace, dataClassification: "synthetic" as const };
    const repository = new InMemoryContentOperationsRepository([synthetic]);
    const service = new ContentOperationsService(
      repository,
      new PublicationEligibilityService(),
      () => "synthetic-correlation",
    );

    const result = await service.transition(actor, "place", synthetic.id, "published");

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.metadata?.reasons).toContain("SYNTHETIC_CONTENT");
  });

  it("requires Founder authority for emergency publication", async () => {
    const emergency: ContentRecord = {
      ...eligiblePlace,
      kind: "emergency_service",
      emergency: {
        authoritativeSource: true,
        phoneVerified: true,
        secondaryVerificationRequired: true,
        secondaryVerificationComplete: true,
        publicationEligible: true,
      },
    };
    const repository = new InMemoryContentOperationsRepository([emergency]);
    const service = new ContentOperationsService(
      repository,
      new PublicationEligibilityService(),
      () => "synthetic-correlation",
    );

    const result = await service.transition(
      { id: "synthetic-editor", role: "editor" },
      "emergency_service",
      emergency.id,
      "published",
    );

    expect(!result.ok && result.error.code).toBe("PERMISSION");
  });

  it("rolls back content transitions when audit persistence fails", async () => {
    const repository = new InMemoryContentOperationsRepository([eligiblePlace]);
    repository.failAudit = true;
    const service = new ContentOperationsService(
      repository,
      new PublicationEligibilityService(),
      () => "synthetic-correlation",
    );

    const result = await service.transition(
      actor,
      "place",
      eligiblePlace.id,
      "published",
    );

    expect(result.ok).toBe(false);
    expect(repository.records.values().next().value?.status).toBe("approved");
  });

  it("creates nationwide imports as bounded atomic draft batches", async () => {
    const repository = new InMemoryContentOperationsRepository();
    const service = new ContentOperationsService(
      repository,
      new PublicationEligibilityService(),
      () => "synthetic-correlation",
    );
    const drafts = ["province-a", "province-b"].map((id) => ({
      id,
      kind: "destination" as const,
      dataClassification: eligiblePlace.dataClassification,
      canonicalThaiName: eligiblePlace.canonicalThaiName,
      destinationActive: eligiblePlace.destinationActive,
      travelerTranslationApproved: eligiblePlace.travelerTranslationApproved,
      approvedSourceCount: eligiblePlace.approvedSourceCount,
      verifiedAssertionCount: eligiblePlace.verifiedAssertionCount,
      verificationComplete: eligiblePlace.verificationComplete,
      staleAt: eligiblePlace.staleAt,
      suppressed: eligiblePlace.suppressed,
      mediaRightsValid: eligiblePlace.mediaRightsValid,
    }));
    const result = await service.createDraftBatch(actor, drafts);
    expect(result.ok && result.value).toHaveLength(2);
    expect(
      [...repository.records.values()].every((record) => record.status === "draft"),
    ).toBe(true);
    expect(repository.audits).toHaveLength(2);
  });
});
