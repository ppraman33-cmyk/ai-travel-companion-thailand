import type {
  ContentRecord,
  EligibilityReasonCode,
  PublicationEligibility,
} from "./types";

const hasExpired = (value: string | undefined, now: Date): boolean =>
  value !== undefined && new Date(value).getTime() <= now.getTime();

export class PublicationEligibilityService {
  evaluate(record: ContentRecord, now = new Date()): PublicationEligibility {
    const reasons: EligibilityReasonCode[] = [];
    const missingRequirements: string[] = [];
    const staleRequirements: string[] = [];
    const rightsIssues: string[] = [];
    const emergencyCriticalFailures: string[] = [];

    const missing = (code: EligibilityReasonCode, message: string) => {
      reasons.push(code);
      missingRequirements.push(message);
    };

    if (record.dataClassification === "synthetic") {
      reasons.push("SYNTHETIC_CONTENT");
    }
    if (!record.canonicalThaiName?.trim()) {
      missing("MISSING_THAI_NAME", "Canonical Thai name");
    }
    if (!record.destinationActive) {
      missing("DESTINATION_INACTIVE", "Active destination");
    }
    if (!record.travelerTranslationApproved) {
      missing("TRANSLATION_UNAPPROVED", "Reviewed traveler-facing translation");
    }
    if (record.approvedSourceCount < 1) {
      reasons.push("SOURCE_RIGHTS_MISSING");
      rightsIssues.push("No approved source rights");
    }
    if (record.verifiedAssertionCount < 1) {
      missing("ASSERTION_MISSING", "Verified field assertion");
    }
    if (!record.verificationComplete) {
      missing("VERIFICATION_INCOMPLETE", "Current verification");
    }
    if (hasExpired(record.staleAt, now)) {
      reasons.push("STALE_CONTENT");
      staleRequirements.push("Content freshness review");
    }
    if (record.suppressed) {
      reasons.push("CONTENT_SUPPRESSED");
    }
    if (!record.mediaRightsValid) {
      reasons.push("MEDIA_RIGHTS_INVALID");
      rightsIssues.push("Media source or license rights are invalid");
    }
    if (record.kind === "event_occurrence" && record.occurrenceActive !== true) {
      reasons.push("OCCURRENCE_INACTIVE");
    }

    if (record.kind === "emergency_service") {
      const emergency = record.emergency;
      if (!emergency?.authoritativeSource) {
        reasons.push("EMERGENCY_AUTHORITY_MISSING");
        emergencyCriticalFailures.push("Authoritative emergency source missing");
      }
      if (!emergency?.phoneVerified) {
        reasons.push("EMERGENCY_PHONE_UNVERIFIED");
        emergencyCriticalFailures.push("Emergency phone is not verified");
      }
      if (
        emergency?.secondaryVerificationRequired &&
        !emergency.secondaryVerificationComplete
      ) {
        reasons.push("EMERGENCY_SECONDARY_VERIFICATION_MISSING");
        emergencyCriticalFailures.push("Required secondary verification missing");
      }
      if (!emergency?.publicationEligible) {
        reasons.push("EMERGENCY_DATABASE_GATE_FAILED");
        emergencyCriticalFailures.push("Emergency persistence gate is not eligible");
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons: [...new Set(reasons)],
      warnings: [],
      missingRequirements,
      staleRequirements,
      rightsIssues,
      emergencyCriticalFailures,
    };
  }
}
