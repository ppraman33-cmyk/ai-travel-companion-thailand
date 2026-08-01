import type {
  EmergencyService,
  MediaAsset,
  Place,
  Source,
  Trip,
  Verification,
} from "@/domain/models";
import type {
  EmergencyProfileRow,
  MediaAssetRow,
  PlaceRow,
  SourceRow,
  TripRow,
  VerificationRow,
} from "@/infrastructure/supabase/types";
import { appError, type AppError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

export interface PlaceRelations {
  readonly sourceIds: readonly string[];
  readonly mediaAssetIds: readonly string[];
  readonly verificationId: string;
}

export function mapPlaceRow(
  row: PlaceRow,
  relations: PlaceRelations,
): Result<Place, AppError> {
  if (
    row.place_category !== "restaurant" &&
    row.place_category !== "attraction" &&
    row.place_category !== "emergency_service"
  ) {
    return failure(
      appError(
        "VALIDATION",
        "The database place category has no approved domain mapping.",
      ),
    );
  }

  return success({
    id: row.id,
    dataClassification: row.data_classification,
    subtype: row.place_category,
    name: row.default_english_name ?? row.canonical_thai_name,
    location: {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    },
    sourceIds: relations.sourceIds,
    mediaAssetIds: relations.mediaAssetIds,
    verificationId: relations.verificationId,
  });
}

export function mapEmergencyRows(
  place: Place,
  profile: EmergencyProfileRow,
): Result<EmergencyService, AppError> {
  if (place.subtype !== "emergency_service") {
    return failure(
      appError(
        "VALIDATION",
        "Emergency persistence data references a non-emergency Place.",
      ),
    );
  }
  return success({
    ...place,
    subtype: "emergency_service",
    serviceType: profile.emergency_category,
    emergencyVerification: {
      status:
        profile.suppression_status === "not_suppressed" && profile.publication_eligible
          ? "verified"
          : "suppressed",
      checkedAt: profile.verified_at,
      nextCheckAt: profile.next_verification_at,
      criticalFieldsVerified: profile.publication_eligible,
    },
  });
}

export const mapTripRow = (row: TripRow): Trip => ({
  id: row.id,
  travelerSessionId: row.traveler_session_id,
  title: row.title,
});

export const mapMediaRow = (row: MediaAssetRow): MediaAsset => ({
  id: row.id,
  dataClassification: row.data_classification,
  uri: row.storage_key,
  purpose: row.ai_generated_decorative ? "decorative" : "real_place",
  isAiGenerated: row.ai_generated_decorative,
  sourceId: row.source_id,
  licenseId: row.license_id,
});

export const mapSourceRow = (row: SourceRow): Source => ({
  id: row.id,
  name: row.title,
  sourceUri: row.source_url ?? row.document_reference ?? "about:blank",
  retrievedAt: row.accessed_at,
  authorizationReference: row.usage_rights_status,
});

export const mapVerificationRow = (row: VerificationRow): Verification => ({
  id: row.id,
  status:
    row.status === "verified" || row.status === "suppressed"
      ? row.status
      : row.status === "pending"
        ? "pending"
        : "unverified",
  verifiedAt: row.verified_at ?? undefined,
  verifierReference: row.reviewer_id ?? undefined,
});
