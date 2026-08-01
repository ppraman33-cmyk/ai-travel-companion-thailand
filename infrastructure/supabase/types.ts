export type Json =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Json | undefined }
  | readonly Json[];

export type DataClassificationRow = "real" | "synthetic";
export type PublicationStatusRow =
  | "draft"
  | "evidence_pending"
  | "review_pending"
  | "approved"
  | "published"
  | "suppressed"
  | "archived";
export type VerificationStatusRow =
  | "unverified"
  | "pending"
  | "verified"
  | "disputed"
  | "expired"
  | "rejected"
  | "suppressed";

export interface PlaceRow {
  readonly id: string;
  readonly destination_id: string;
  readonly geography_id: string;
  readonly canonical_thai_name: string;
  readonly default_english_name: string | null;
  readonly normalized_search_name: string;
  readonly address_summary: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly place_category:
    | "restaurant"
    | "attraction"
    | "emergency_service"
    | "market"
    | "walking_street"
    | "other";
  readonly operating_status: string;
  readonly publication_status: PublicationStatusRow;
  readonly verification_status: VerificationStatusRow;
  readonly data_classification: DataClassificationRow;
  readonly last_checked_at: string | null;
  readonly stale_at: string | null;
  readonly suppressed_at: string | null;
  readonly suppression_reason: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly archived_at: string | null;
}

export interface TripRow {
  readonly id: string;
  readonly traveler_session_id: string;
  readonly title: string;
  readonly start_date: string | null;
  readonly end_date: string | null;
  readonly timezone: string;
  readonly trip_status: string;
  readonly notes: string | null;
  readonly data_classification: DataClassificationRow;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

export interface EmergencyProfileRow {
  readonly place_id: string;
  readonly emergency_category:
    | "hospital"
    | "clinic"
    | "pharmacy"
    | "rescue"
    | "police"
    | "fire"
    | "tourist_assistance";
  readonly verified_at: string;
  readonly next_verification_at: string;
  readonly stale_at: string;
  readonly suppression_status:
    "not_suppressed" | "field_suppressed" | "fully_suppressed";
  readonly publication_eligible: boolean;
}

export interface MediaAssetRow {
  readonly id: string;
  readonly storage_key: string;
  readonly source_id: string;
  readonly license_id: string;
  readonly publication_status: PublicationStatusRow;
  readonly takedown_status: "clear" | "requested" | "removed";
  readonly data_classification: DataClassificationRow;
  readonly ai_generated_decorative: boolean;
  readonly approved_display_contexts: readonly string[];
}

export interface SourceRow {
  readonly id: string;
  readonly title: string;
  readonly source_url: string | null;
  readonly document_reference: string | null;
  readonly accessed_at: string;
  readonly usage_rights_status: string;
  readonly ownership_status:
    "owned" | "licensed" | "permission_granted" | "unclear" | "prohibited";
  readonly provenance_verification_status: VerificationStatusRow;
  readonly provenance_verified_at: string | null;
  readonly provenance_verifier_id: string | null;
  readonly evidence_locator: string | null;
}

export interface VerificationRow {
  readonly id: string;
  readonly status: VerificationStatusRow;
  readonly verified_at: string | null;
  readonly reviewer_id: string | null;
}

export interface Database {
  readonly public: {
    readonly Tables: {
      readonly places: TableDefinition<PlaceRow, PlaceInsert, PlaceUpdate>;
      readonly trips: TableDefinition<TripRow, TripInsert, TripUpdate>;
      readonly emergency_service_profiles: TableDefinition<
        EmergencyProfileRow,
        never,
        never
      >;
      readonly media_assets: TableDefinition<MediaAssetRow, never, never>;
      readonly sources: TableDefinition<SourceRow, never, never>;
      readonly verifications: TableDefinition<VerificationRow, never, never>;
    };
  };
}

interface TableDefinition<Row, Insert, Update> {
  readonly Row: Row;
  readonly Insert: Insert;
  readonly Update: Update;
}

export type PlaceInsert = Omit<PlaceRow, "created_at" | "updated_at">;
export type PlaceUpdate = Partial<Omit<PlaceInsert, "id">>;
export type TripInsert = Omit<TripRow, "created_at" | "updated_at" | "deleted_at"> & {
  readonly deleted_at?: string | null;
};
export type TripUpdate = Partial<Omit<TripInsert, "id" | "traveler_session_id">>;

// Manually maintained boundary generated from the Phase 3B migration contract.
// Replace with: supabase gen types typescript --local > infrastructure/supabase/types.generated.ts
// once a local Supabase stack can complete a clean reset.
