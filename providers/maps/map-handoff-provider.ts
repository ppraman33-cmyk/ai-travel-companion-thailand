import type { Coordinates, EntityId } from "@/domain/models";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export type ExternalMapApplication = "google_maps" | "apple_maps";

export interface MapHandoffRequest {
  readonly application: ExternalMapApplication;
  readonly placeId: EntityId;
  readonly destination: Coordinates;
  readonly destinationLabel: string;
}

export interface MapHandoffProvider {
  createExternalHandoffUrl(request: MapHandoffRequest): Result<URL, AppError>;
}
