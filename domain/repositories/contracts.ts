import type {
  AIRequest,
  AIResponse,
  EmergencyService,
  EntityId,
  MediaAsset,
  Place,
  Source,
  Trip,
  Verification,
} from "@/domain/models";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface PlaceRepository {
  findById(id: EntityId): Promise<Result<Place | null, AppError>>;
  findByIds(ids: readonly EntityId[]): Promise<Result<readonly Place[], AppError>>;
}

export interface TripRepository {
  findById(id: EntityId): Promise<Result<Trip | null, AppError>>;
  save(trip: Trip): Promise<Result<Trip, AppError>>;
}

export interface EmergencyRepository {
  findVerifiedNearby(location: {
    readonly latitude: number;
    readonly longitude: number;
  }): Promise<Result<readonly EmergencyService[], AppError>>;
}

export interface MediaRepository {
  findByIds(ids: readonly EntityId[]): Promise<Result<readonly MediaAsset[], AppError>>;
}

export interface SourceRepository {
  findByIds(ids: readonly EntityId[]): Promise<Result<readonly Source[], AppError>>;
}

export interface AIRepository {
  recordRequest(request: AIRequest): Promise<Result<void, AppError>>;
  recordResponse(response: AIResponse): Promise<Result<void, AppError>>;
}

export interface VerificationRepository {
  findById(id: EntityId): Promise<Result<Verification | null, AppError>>;
}
