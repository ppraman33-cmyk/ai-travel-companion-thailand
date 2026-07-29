import type {
  AIRequest,
  AIResponse,
  Coordinates,
  EmergencyService,
  EntityId,
  MediaAsset,
  Place,
  Trip,
  Verification,
} from "@/domain/models";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface PlaceCatalogService {
  getPlace(id: EntityId): Promise<Result<Place, AppError>>;
}

export interface TripService {
  getTrip(id: EntityId): Promise<Result<Trip, AppError>>;
}

export interface EmergencyInformationService {
  getVerifiedNearby(
    location: Coordinates,
  ): Promise<Result<readonly EmergencyService[], AppError>>;
}

export interface MediaService {
  getAuthorizedAssets(
    ids: readonly EntityId[],
  ): Promise<Result<readonly MediaAsset[], AppError>>;
}

export interface VerificationService {
  getVerification(id: EntityId): Promise<Result<Verification, AppError>>;
}

export interface TravelAssistantService {
  respond(request: AIRequest): Promise<Result<AIResponse, AppError>>;
}
