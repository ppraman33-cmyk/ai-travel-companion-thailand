import type { DataClassification, EntityId, IsoDateTime } from "@/domain/models";

export type ContentEntityKind =
  | "geography"
  | "destination"
  | "place"
  | "restaurant_profile"
  | "attraction_profile"
  | "food_specialty"
  | "event"
  | "event_occurrence"
  | "emergency_service"
  | "translation"
  | "contact"
  | "media_asset";

export type ContentLifecycleStatus =
  | "draft"
  | "evidence_pending"
  | "review_pending"
  | "approved"
  | "published"
  | "suppressed"
  | "archived";

export type AdminRole = "founder" | "editor";

export interface AdminActor {
  readonly id: EntityId;
  readonly role: AdminRole;
}

export interface ContentRecord {
  readonly id: EntityId;
  readonly kind: ContentEntityKind;
  readonly status: ContentLifecycleStatus;
  readonly dataClassification: DataClassification;
  readonly canonicalThaiName?: string;
  readonly destinationActive: boolean;
  readonly travelerTranslationApproved: boolean;
  readonly approvedSourceCount: number;
  readonly verifiedAssertionCount: number;
  readonly verificationComplete: boolean;
  readonly staleAt?: IsoDateTime;
  readonly suppressed: boolean;
  readonly mediaRightsValid: boolean;
  readonly occurrenceActive?: boolean;
  readonly emergency?: Readonly<{
    authoritativeSource: boolean;
    phoneVerified: boolean;
    secondaryVerificationRequired: boolean;
    secondaryVerificationComplete: boolean;
    publicationEligible: boolean;
  }>;
}

export type EligibilityReasonCode =
  | "SYNTHETIC_CONTENT"
  | "MISSING_THAI_NAME"
  | "DESTINATION_INACTIVE"
  | "TRANSLATION_UNAPPROVED"
  | "SOURCE_RIGHTS_MISSING"
  | "ASSERTION_MISSING"
  | "VERIFICATION_INCOMPLETE"
  | "STALE_CONTENT"
  | "CONTENT_SUPPRESSED"
  | "MEDIA_RIGHTS_INVALID"
  | "OCCURRENCE_INACTIVE"
  | "EMERGENCY_AUTHORITY_MISSING"
  | "EMERGENCY_PHONE_UNVERIFIED"
  | "EMERGENCY_SECONDARY_VERIFICATION_MISSING"
  | "EMERGENCY_DATABASE_GATE_FAILED";

export interface PublicationEligibility {
  readonly eligible: boolean;
  readonly reasons: readonly EligibilityReasonCode[];
  readonly warnings: readonly string[];
  readonly missingRequirements: readonly string[];
  readonly staleRequirements: readonly string[];
  readonly rightsIssues: readonly string[];
  readonly emergencyCriticalFailures: readonly string[];
}

export interface AuditMutation {
  readonly actorId: EntityId;
  readonly action: string;
  readonly entityKind: ContentEntityKind;
  readonly entityId: EntityId;
  readonly correlationId: string;
  readonly safeMetadata: Readonly<Record<string, string | number | boolean | null>>;
}
