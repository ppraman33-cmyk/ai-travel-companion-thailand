import type { AppError } from "@/shared/errors/app-error";
import { appError } from "@/shared/errors/app-error";
import { failure, type Result } from "@/shared/result/result";

export interface TravelerTrip {
  readonly id: string;
  readonly sessionId: string;
  readonly title: string;
  readonly status: "draft" | "active" | "completed" | "deleted";
}

export interface TravelerSavedPlace {
  readonly sessionId: string;
  readonly placeId: string;
  readonly tripId?: string;
}

export interface TravelerReport {
  readonly id: string;
  readonly sessionId: string;
  readonly placeId: string;
  readonly category: string;
  readonly description: string;
}

export interface TravelerItineraryItem {
  readonly id: string;
  readonly dayId: string;
  readonly order: number;
  readonly placeId?: string;
  readonly eventOccurrenceId?: string;
  readonly notes?: string;
  readonly aiGenerated: boolean;
}

export interface TravelerRepository {
  listTrips(
    sessionId: string,
    limit: number,
  ): Promise<Result<readonly TravelerTrip[], AppError>>;
  findTrip(id: string): Promise<Result<TravelerTrip | null, AppError>>;
  saveTrip(trip: TravelerTrip): Promise<Result<TravelerTrip, AppError>>;
  deleteTrip(id: string, sessionId: string): Promise<Result<void, AppError>>;
  listSaved(
    sessionId: string,
    limit: number,
  ): Promise<Result<readonly TravelerSavedPlace[], AppError>>;
  savePlace(record: TravelerSavedPlace): Promise<Result<void, AppError>>;
  deleteSaved(sessionId: string, placeId: string): Promise<Result<void, AppError>>;
  createReport(report: TravelerReport): Promise<Result<void, AppError>>;
  saveItem(
    sessionId: string,
    tripId: string,
    item: TravelerItineraryItem,
  ): Promise<Result<TravelerItineraryItem, AppError>>;
  deleteItem(
    sessionId: string,
    tripId: string,
    itemId: string,
  ): Promise<Result<void, AppError>>;
}

export class TravelerService {
  constructor(private readonly repository: TravelerRepository) {}

  listTrips(sessionId: string) {
    return this.repository.listTrips(sessionId, 50);
  }

  async findOwnedTrip(sessionId: string, tripId: string) {
    const result = await this.repository.findTrip(tripId);
    if (!result.ok || !result.value) return result;
    return result.value.sessionId === sessionId
      ? result
      : failure(appError("NOT_FOUND", "Trip was not found."));
  }

  saveTrip(sessionId: string, trip: Omit<TravelerTrip, "sessionId">) {
    return this.repository.saveTrip({ ...trip, sessionId });
  }

  async deleteTrip(sessionId: string, tripId: string) {
    const trip = await this.findOwnedTrip(sessionId, tripId);
    return trip.ok && trip.value ? this.repository.deleteTrip(tripId, sessionId) : trip;
  }

  listSaved(sessionId: string) {
    return this.repository.listSaved(sessionId, 50);
  }

  savePlace(sessionId: string, placeId: string, tripId?: string) {
    return this.repository.savePlace({ sessionId, placeId, tripId });
  }

  deleteSaved(sessionId: string, placeId: string) {
    return this.repository.deleteSaved(sessionId, placeId);
  }

  createReport(sessionId: string, report: Omit<TravelerReport, "sessionId">) {
    return this.repository.createReport({ ...report, sessionId });
  }

  async saveItem(sessionId: string, tripId: string, item: TravelerItineraryItem) {
    const trip = await this.findOwnedTrip(sessionId, tripId);
    return trip.ok && trip.value
      ? this.repository.saveItem(sessionId, tripId, item)
      : trip;
  }

  async deleteItem(sessionId: string, tripId: string, itemId: string) {
    const trip = await this.findOwnedTrip(sessionId, tripId);
    return trip.ok && trip.value
      ? this.repository.deleteItem(sessionId, tripId, itemId)
      : trip;
  }
}
