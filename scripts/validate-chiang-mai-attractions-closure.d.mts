import type { ChiangMaiAttractionEvidenceData } from "./validate-chiang-mai-attractions-evidence.mjs";

export interface ChiangMaiAttractionsClosure {
  acceptedCoverageGaps: string[];
  inheritedIdentityLockSha256: string;
  revalidationTriggers: string[];
  [key: string]: unknown;
}

export function loadChiangMaiAttractionsClosure(
  scanRoot?: string,
): ChiangMaiAttractionsClosure;
export function validateChiangMaiAttractionsClosure(
  data: ChiangMaiAttractionEvidenceData,
  closure: ChiangMaiAttractionsClosure,
): string[];
