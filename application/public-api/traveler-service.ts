import type { AppError } from "@/shared/errors/app-error";
import { appError } from "@/shared/errors/app-error";
import { failure, type Result } from "@/shared/result/result";

export interface TravelerTrip {
  readonly id: string;
  readonly sessionId: string;
  readonly title: string;
  readonly status: "draft" | "active" | "completed" | "deleted";
  readonly startDate?: string;
  readonly endDate?: string;
  readonly notes?: string;
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
  readonly plannedAt?: string;
  readonly aiGenerated: boolean;
}

export interface TravelerItineraryDay {
  readonly id: string;
  readonly tripId: string;
  readonly plannedDate: string;
  readonly dayOrder: number;
  readonly notes?: string;
}

export interface TravelerPreferences {
  readonly transportation?: string;
  readonly travelStyle?: string;
  readonly companions?: string;
  readonly activityLevel?: string;
  readonly budget?: string;
  readonly language?: string;
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
  listItems(
    sessionId: string,
    tripId: string,
  ): Promise<Result<readonly TravelerItineraryItem[], AppError>>;
  listDays(
    sessionId: string,
    tripId: string,
  ): Promise<Result<readonly TravelerItineraryDay[], AppError>>;
  saveDay(day: TravelerItineraryDay): Promise<Result<TravelerItineraryDay, AppError>>;
  reorderItems(
    sessionId: string,
    tripId: string,
    dayId: string,
    orderedItemIds: readonly string[],
  ): Promise<Result<readonly TravelerItineraryItem[], AppError>>;
  getPreferences(sessionId: string): Promise<Result<TravelerPreferences, AppError>>;
  savePreferences(
    sessionId: string,
    preferences: TravelerPreferences,
  ): Promise<Result<TravelerPreferences, AppError>>;
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

  async listItems(sessionId: string, tripId: string) {
    const trip = await this.findOwnedTrip(sessionId, tripId);
    return trip.ok && trip.value ? this.repository.listItems(sessionId, tripId) : trip;
  }

  async listDays(sessionId: string, tripId: string) {
    const trip = await this.findOwnedTrip(sessionId, tripId);
    return trip.ok && trip.value ? this.repository.listDays(sessionId, tripId) : trip;
  }

  async saveDay(sessionId: string, day: TravelerItineraryDay) {
    const trip = await this.findOwnedTrip(sessionId, day.tripId);
    return trip.ok && trip.value ? this.repository.saveDay(day) : trip;
  }

  async reorderItems(
    sessionId: string,
    tripId: string,
    dayId: string,
    orderedItemIds: readonly string[],
  ) {
    const trip = await this.findOwnedTrip(sessionId, tripId);
    return trip.ok && trip.value
      ? this.repository.reorderItems(sessionId, tripId, dayId, orderedItemIds)
      : trip;
  }

  getPreferences(sessionId: string) {
    return this.repository.getPreferences(sessionId);
  }

  savePreferences(sessionId: string, preferences: TravelerPreferences) {
    return this.repository.savePreferences(sessionId, preferences);
  }
}
