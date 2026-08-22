import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  chiangMaiCategoryCoverage,
  chiangMaiDistricts,
  chiangMaiSources,
  getChiangMaiCoverageSummary,
} from "@/application/content/chiang-mai-evidence";
import {
  DistrictEvidenceImportService,
  type AuditedDistrictImportPort,
} from "@/application/admin/district-evidence-import";
import { success } from "@/shared/result/result";

describe("M3 Chiang Mai evidence baseline", () => {
  it("contains all 25 official district identities with unique codes and IDs", () => {
    expect(chiangMaiDistricts).toHaveLength(25);
    expect(new Set(chiangMaiDistricts.map((item) => item.officialCode)).size).toBe(25);
    expect(new Set(chiangMaiDistricts.map((item) => item.canonicalId)).size).toBe(25);
    expect(chiangMaiDistricts.map((item) => item.officialCode)).toEqual(
      Array.from({ length: 25 }, (_, index) => String(5001 + index)),
    );
  });

  it("links every district only to Chiang Mai and documents every missing highlight", () => {
    for (const district of chiangMaiDistricts) {
      expect(district.provinceCode).toBe("50");
      expect(district.provinceIdentifier).toBe("TH-50");
      expect(district.officialCode.startsWith(district.provinceCode)).toBe(true);
      expect(district.verificationStatus).toBe("verified");
      expect(district.highlightStatus).toBe("coverage-gap");
      expect(district.highlights).toHaveLength(0);
      expect(district.coverageGaps.length).toBeGreaterThan(0);
    }
  });

  it("keeps every real district record unpublished with media rights pending", () => {
    expect(
      chiangMaiDistricts.every(
        (item) =>
          item.publicationStatus === "evidence-pending" &&
          item.mediaRightsStatus === "media-rights-pending",
      ),
    ).toBe(true);
    expect(getChiangMaiCoverageSummary().publicationEligible).toBe(false);
    expect(chiangMaiCategoryCoverage).toHaveLength(14);
  });

  it("uses HTTPS provenance and separates primary from supporting evidence", () => {
    expect(chiangMaiSources.every((source) => source.url.startsWith("https://"))).toBe(
      true,
    );
    expect(getChiangMaiCoverageSummary()).toMatchObject({
      primarySources: 2,
      supportingSources: 1,
      verifiedDistrictIdentities: 25,
      verifiedHighlights: 0,
      documentedCoverageGaps: 75,
    });
  });

  it("is not imported by public API, SEO, sitemap, or offline cache source", () => {
    const publicFiles = [
      "application/public-api/catalog-service.ts",
      "application/public-api/traveler-service.ts",
      "app/manifest.ts",
      "public/sw.js",
    ];
    for (const file of publicFiles) {
      const content = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(content).not.toContain("chiang-mai-evidence");
      expect(content).not.toContain("chiangMaiDistricts");
    }
  });
});

describe("district evidence import boundary", () => {
  const validBatch = {
    batchId: "chiang-mai-5001-v1",
    districtCode: "5001",
    dataClassification: "real",
    publicationStatus: "evidence-pending",
    records: [
      {
        canonicalKey: "district:5001",
        category: "district_identity",
        sourceUrl: "https://multi.dopa.go.th/evidence.pdf",
        sourceAssertion: "Official district identity assertion.",
      },
    ],
  } as const;

  it("permits one bounded audited district batch for Founder authority", async () => {
    const importDistrictBatch = vi
      .fn()
      .mockResolvedValue(success({ imported: 1, replayed: false }));
    const service = new DistrictEvidenceImportService({
      importDistrictBatch,
    } as AuditedDistrictImportPort);
    const result = await service.execute(
      { id: "founder", role: "founder" },
      validBatch,
      "correlation-id",
    );
    expect(result.ok).toBe(true);
    expect(importDistrictBatch).toHaveBeenCalledOnce();
  });

  it("rejects Editor, cross-province, publishable, missing-provenance, and mixed batches", async () => {
    const importDistrictBatch = vi.fn();
    const service = new DistrictEvidenceImportService({
      importDistrictBatch,
    } as AuditedDistrictImportPort);
    const candidates = [
      [{ id: "editor", role: "editor" } as const, validBatch],
      [
        { id: "founder", role: "founder" } as const,
        { ...validBatch, districtCode: "5101" },
      ],
      [
        { id: "founder", role: "founder" } as const,
        { ...validBatch, publicationStatus: "published" },
      ],
      [
        { id: "founder", role: "founder" } as const,
        { ...validBatch, records: [{ ...validBatch.records[0], sourceUrl: "" }] },
      ],
      [
        { id: "founder", role: "founder" } as const,
        { ...validBatch, batchId: "chiang-mai-5002-v1" },
      ],
    ] as const;
    for (const [actor, candidate] of candidates) {
      expect((await service.execute(actor, candidate, "correlation-id")).ok).toBe(
        false,
      );
    }
    expect(importDistrictBatch).not.toHaveBeenCalled();
  });
});
