export interface VerificationDecision {
  recordId: string;
  outcome: "verified_research_record" | "pending_more_evidence" | "excluded";
  reason: string;
  checks: {
    identity: string;
    currentOperation: string;
    districtParent: string;
    ownerOperator: string;
  };
  verificationSourceIds: string[];
}

export interface RestaurantVerificationData {
  verification: {
    decisions: VerificationDecision[];
    districts: Array<{
      code: string;
      nameTh: string;
      reviewed: number;
      verified: number;
      pending: number;
    }>;
    summary: {
      baselineRecords: number;
      reviewedRecords: number;
      verifiedResearchRecords: number;
      pendingMoreEvidence: number;
      excludedRecords: number;
    };
    publicationEligibility: string;
    productionImportEligibility: string;
  };
  registry: {
    records: Array<{ id: string }>;
  };
}

export function loadChiangMaiRestaurantVerification(
  scanRoot?: string,
): RestaurantVerificationData;

export function validateChiangMaiRestaurantVerification(
  data: RestaurantVerificationData,
): string[];
