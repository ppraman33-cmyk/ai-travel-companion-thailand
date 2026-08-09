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
  readonly destination?: string;
  readonly timezone?: string;
  readonly travelerProfileId?: string;
}

export interface TravelerProfile {
  readonly id: string;
  readonly sessionId: string;
  readonly name: string;
  readonly description?: string;
  readonly transportation?: string;
  readonly travelStyle?: string;
  readonly companions?: string;
  readonly activityLevel?: string;
  readonly mobilityNeeds?: string;
  readonly budget?: string;
  readonly interests: readonly string[];
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string;
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
  listProfiles(
    sessionId: string,
  ): Promise<Result<readonly TravelerProfile[], AppError>>;
  findProfile(id: string): Promise<Result<TravelerProfile | null, AppError>>;
  saveProfile(profile: TravelerProfile): Promise<Result<TravelerProfile, AppError>>;
  setActiveProfile(
    sessionId: string,
    profileId: string,
  ): Promise<Result<TravelerProfile, AppError>>;
  deleteProfile(
    sessionId: string,
    profileId: string,
    action: "block" | "reassign" | "detach",
    replacementProfileId?: string,
  ): Promise<Result<void, AppError>>;
  listTrips(
    sessionId: string,
    limit: number,
  ): Promise<Result<readonly TravelerTrip[], AppError>>;
  findTrip(id: string): Promise<Result<TravelerTrip | null, AppError>>;
  findDay(id: string): Promise<Result<TravelerItineraryDay | null, AppError>>;
  findItem(id: string): Promise<Result<TravelerItineraryItem | null, AppError>>;
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

  listProfiles(sessionId: string) {
    return this.repository.listProfiles(sessionId);
  }

  async findOwnedProfile(sessionId: string, profileId: string) {
    const result = await this.repository.findProfile(profileId);
    if (!result.ok || !result.value) return result;
    return result.value.sessionId === sessionId && !result.value.deletedAt
      ? result
      : failure(appError("NOT_FOUND", "Travel profile was not found."));
  }

  async saveProfile(
    sessionId: string,
    profile: Omit<TravelerProfile, "sessionId" | "createdAt" | "updatedAt">,
  ) {
    const existing = await this.repository.findProfile(profile.id);
    if (!existing.ok) return existing;
    if (
      existing.value &&
      (existing.value.sessionId !== sessionId || existing.value.deletedAt)
    ) {
      return failure(appError("NOT_FOUND", "Travel profile was not found."));
    }
    const now = new Date().toISOString();
    const saved = await this.repository.saveProfile({
      ...profile,
      sessionId,
      // New profiles are first persisted inactive. Activation then happens through
      // the atomic database RPC, avoiding the one-active-profile unique-index race.
      active: existing.value?.active ?? false,
      createdAt: existing.value?.createdAt ?? now,
      updatedAt: now,
    });
    if (!saved.ok || !profile.active) return saved;
    return this.repository.setActiveProfile(sessionId, profile.id);
  }

  async setActiveProfile(sessionId: string, profileId: string) {
    const owned = await this.findOwnedProfile(sessionId, profileId);
    return owned.ok && owned.value
      ? this.repository.setActiveProfile(sessionId, profileId)
      : owned;
  }

  async deleteProfile(
    sessionId: string,
    profileId: string,
    action: "block" | "reassign" | "detach",
    replacementProfileId?: string,
  ) {
    const owned = await this.findOwnedProfile(sessionId, profileId);
    if (!owned.ok || !owned.value) return owned;
    if (replacementProfileId) {
      const replacement = await this.findOwnedProfile(sessionId, replacementProfileId);
      if (!replacement.ok || !replacement.value) return replacement;
    }
    return this.repository.deleteProfile(
      sessionId,
      profileId,
      action,
      replacementProfileId,
    );
  }

  async findOwnedTrip(sessionId: string, tripId: string) {
    const result = await this.repository.findTrip(tripId);
    if (!result.ok || !result.value) return result;
    return result.value.sessionId === sessionId && result.value.status !== "deleted"
      ? result
      : failure(appError("NOT_FOUND", "Trip was not found."));
  }

  async saveTrip(sessionId: string, trip: Omit<TravelerTrip, "sessionId">) {
    const existing = await this.repository.findTrip(trip.id);
    if (!existing.ok) return existing;
    if (
      existing.value &&
      (existing.value.sessionId !== sessionId || existing.value.status === "deleted")
    ) {
      return failure(appError("NOT_FOUND", "Trip was not found."));
    }
    if (trip.travelerProfileId) {
      const profile = await this.findOwnedProfile(sessionId, trip.travelerProfileId);
      if (!profile.ok || !profile.value) return profile;
    }
    return this.repository.saveTrip({ ...trip, sessionId });
  }

  async deleteTrip(sessionId: string, tripId: string) {
    const trip = await this.findOwnedTrip(sessionId, tripId);
    return trip.ok && trip.value ? this.repository.deleteTrip(tripId, sessionId) : trip;
  }

  listSaved(sessionId: string) {
    return this.repository.listSaved(sessionId, 50);
  }

  async savePlace(sessionId: string, placeId: string, tripId?: string) {
    if (tripId) {
      const trip = await this.findOwnedTrip(sessionId, tripId);
      if (!trip.ok || !trip.value) return trip;
    }
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
    if (!trip.ok || !trip.value) return trip;
    const existing = await this.repository.findItem(item.id);
    if (!existing.ok) return existing;
    if (existing.value) {
      const existingDay = await this.repository.findDay(existing.value.dayId);
      if (
        !existingDay.ok ||
        !existingDay.value ||
        existingDay.value.tripId !== tripId ||
        existing.value.dayId !== item.dayId
      ) {
        return failure(appError("NOT_FOUND", "Itinerary item was not found."));
      }
    } else if (item.placeId) {
      const currentItems = await this.repository.listItems(sessionId, tripId);
      if (!currentItems.ok) return currentItems;
      if (
        currentItems.value.some(
          (candidate) =>
            candidate.dayId === item.dayId && candidate.placeId === item.placeId,
        )
      ) {
        return failure(
          appError("CONFLICT", "This Place is already planned for that day."),
        );
      }
    }
    return this.repository.saveItem(sessionId, tripId, item);
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
    if (!trip.ok || !trip.value) return trip;
    const existing = await this.repository.findDay(day.id);
    if (!existing.ok) return existing;
    if (existing.value && existing.value.tripId !== day.tripId) {
      return failure(appError("NOT_FOUND", "Itinerary day was not found."));
    }
    return this.repository.saveDay(day);
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
