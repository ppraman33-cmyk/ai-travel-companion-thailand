export type EntityId = string;
export type IsoDateTime = string;
export type LanguageCode = string;
export type DataClassification = "real" | "synthetic";

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export type PlaceSubtype = "restaurant" | "attraction" | "emergency_service";

export interface Place {
  readonly id: EntityId;
  readonly dataClassification: DataClassification;
  readonly subtype: PlaceSubtype;
  readonly name: string;
  readonly location: Coordinates;
  readonly sourceIds: readonly EntityId[];
  readonly mediaAssetIds: readonly EntityId[];
  readonly verificationId: EntityId;
}

export interface Restaurant extends Place {
  readonly subtype: "restaurant";
  readonly cuisineTags: readonly string[];
}

export interface Attraction extends Place {
  readonly subtype: "attraction";
  readonly attractionTags: readonly string[];
}

export interface Food {
  readonly id: EntityId;
  readonly dataClassification: DataClassification;
  readonly name: string;
  readonly foodTags: readonly string[];
  readonly sourceIds: readonly EntityId[];
  readonly mediaAssetIds: readonly EntityId[];
  readonly verificationId: EntityId;
}

export interface Event {
  readonly id: EntityId;
  readonly dataClassification: DataClassification;
  readonly name: string;
  readonly hostPlaceId?: EntityId;
  readonly venuePlaceId?: EntityId;
  readonly startsAt: IsoDateTime;
  readonly endsAt?: IsoDateTime;
  readonly sourceIds: readonly EntityId[];
  readonly mediaAssetIds: readonly EntityId[];
  readonly verificationId: EntityId;
}

export interface EmergencyVerification {
  readonly status: "verified" | "suppressed";
  readonly checkedAt: IsoDateTime;
  readonly nextCheckAt: IsoDateTime;
  readonly criticalFieldsVerified: boolean;
}

export interface EmergencyService extends Place {
  readonly subtype: "emergency_service";
  readonly emergencyVerification: EmergencyVerification;
  readonly serviceType:
    | "hospital"
    | "clinic"
    | "pharmacy"
    | "rescue"
    | "police"
    | "fire"
    | "tourist_assistance";
}

export interface Trip {
  readonly id: EntityId;
  readonly travelerSessionId: EntityId;
  readonly title: string;
  readonly itineraryId?: EntityId;
}

export interface ItineraryItem {
  readonly placeId: EntityId;
  readonly startsAt?: IsoDateTime;
  readonly note?: string;
}

export interface Itinerary {
  readonly id: EntityId;
  readonly tripId: EntityId;
  readonly items: readonly ItineraryItem[];
}

export type MediaPurpose =
  "real_place" | "decorative" | "category" | "marketing" | "atmospheric";

export interface MediaAsset {
  readonly id: EntityId;
  readonly dataClassification: DataClassification;
  readonly uri: string;
  readonly purpose: MediaPurpose;
  readonly isAiGenerated: boolean;
  readonly sourceId: EntityId;
  readonly licenseId: EntityId;
}

export interface Verification {
  readonly id: EntityId;
  readonly status: "unverified" | "pending" | "verified" | "suppressed";
  readonly verifiedAt?: IsoDateTime;
  readonly verifierReference?: string;
}

export interface Source {
  readonly id: EntityId;
  readonly name: string;
  readonly sourceUri: string;
  readonly retrievedAt: IsoDateTime;
  readonly authorizationReference?: string;
}

export interface License {
  readonly id: EntityId;
  readonly name: string;
  readonly termsUri: string;
  readonly attribution?: string;
  readonly permitsPublication: boolean;
}

export interface TravelerSession {
  readonly id: EntityId;
  readonly identityKind: "anonymous";
  readonly preferredLanguages: readonly LanguageCode[];
  readonly createdAt: IsoDateTime;
}

export interface AdminUser {
  readonly id: EntityId;
  readonly role: "reviewer" | "administrator";
}

export interface AuditEvent {
  readonly id: EntityId;
  readonly actorId?: EntityId;
  readonly action: string;
  readonly entityId?: EntityId;
  readonly occurredAt: IsoDateTime;
}

export interface AIRequest {
  readonly id: EntityId;
  readonly travelerSessionId: EntityId;
  readonly prompt: string;
  readonly allowedCatalogRecordIds: readonly EntityId[];
  readonly language: LanguageCode;
}

export interface AIResponse {
  readonly requestId: EntityId;
  readonly text: string;
  readonly citedCatalogRecordIds: readonly EntityId[];
}

export interface IncorrectInformationReport {
  readonly id: EntityId;
  readonly travelerSessionId: EntityId;
  readonly entityId: EntityId;
  readonly description: string;
  readonly createdAt: IsoDateTime;
}
