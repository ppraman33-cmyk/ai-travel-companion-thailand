import type {
  TravelerItineraryDay,
  TravelerItineraryItem,
  TravelerPreferences,
  TravelerProfile,
  TravelerReport,
  TravelerRepository,
  TravelerSavedPlace,
  TravelerTrip,
} from "@/application/public-api/traveler-service";
import type { PersistenceClient } from "@/infrastructure/supabase/persistence-client";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

interface TripRecord {
  readonly id: string;
  readonly traveler_session_id: string;
  readonly title: string;
  readonly trip_status: TravelerTrip["status"];
  readonly start_date: string | null;
  readonly end_date: string | null;
  readonly notes: string | null;
  readonly destination: string | null;
  readonly timezone: string;
  readonly traveler_profile_id: string | null;
}

interface ProfileRecord {
  readonly id: string;
  readonly traveler_session_id: string;
  readonly profile_name: string;
  readonly description: string | null;
  readonly transportation: string | null;
  readonly travel_style: string | null;
  readonly companions: string | null;
  readonly activity_level: string | null;
  readonly mobility_needs: string | null;
  readonly budget_style: string | null;
  readonly preferred_interests: readonly string[];
  readonly is_active: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

interface SavedRecord {
  readonly traveler_session_id: string;
  readonly place_id: string;
  readonly trip_id: string | null;
}

interface DayRecord {
  readonly id: string;
  readonly trip_id: string;
  readonly planned_date: string;
  readonly day_order: number;
  readonly notes: string | null;
}

interface ItemRecord {
  readonly id: string;
  readonly itinerary_day_id: string;
  readonly item_order: number;
  readonly place_id: string | null;
  readonly event_occurrence_id: string | null;
  readonly notes: string | null;
  readonly planned_at: string | null;
  readonly ai_generated: boolean;
}

interface SessionRecord {
  readonly id: string;
  readonly traveler_preferences: Record<string, unknown> | null;
}

export class TravelerPersistenceAdapter implements TravelerRepository {
  constructor(private readonly client: PersistenceClient) {}

  async listProfiles(sessionId: string) {
    const result = await this.client.selectMany<ProfileRecord>({
      table: "traveler_profiles",
      filters: [
        { column: "traveler_session_id", operator: "eq", value: sessionId },
        { column: "deleted_at", operator: "is", value: null },
      ],
      orderBy: { column: "created_at", ascending: true },
      limit: 20,
    });
    return result.ok ? success(result.value.map(this.mapProfile)) : result;
  }

  async findProfile(id: string) {
    const result = await this.client.selectOne<ProfileRecord>({
      table: "traveler_profiles",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    return result.ok
      ? success(result.value ? this.mapProfile(result.value) : null)
      : result;
  }

  async saveProfile(profile: TravelerProfile) {
    const result = await this.client.upsert<ProfileRecord, Record<string, unknown>>(
      "traveler_profiles",
      {
        id: profile.id,
        traveler_session_id: profile.sessionId,
        profile_name: profile.name,
        description: profile.description ?? null,
        transportation: profile.transportation ?? null,
        travel_style: profile.travelStyle ?? null,
        companions: profile.companions ?? null,
        activity_level: profile.activityLevel ?? null,
        mobility_needs: profile.mobilityNeeds ?? null,
        budget_style: profile.budget ?? null,
        preferred_interests: profile.interests,
        is_active: profile.active,
        deleted_at: profile.deletedAt ?? null,
      },
      "id",
    );
    return result.ok ? success(this.mapProfile(result.value)) : result;
  }

  async setActiveProfile(sessionId: string, profileId: string) {
    if (!this.client.rpc) {
      return failure(appError("UNAVAILABLE", "Profile activation is unavailable."));
    }
    const result = await this.client.rpc<ProfileRecord>("set_active_traveler_profile", {
      target_session_id: sessionId,
      target_profile_id: profileId,
    });
    return result.ok ? success(this.mapProfile(result.value)) : result;
  }

  async deleteProfile(
    sessionId: string,
    profileId: string,
    action: "block" | "reassign" | "detach",
    replacementProfileId?: string,
  ) {
    if (!this.client.rpc) {
      return failure(appError("UNAVAILABLE", "Profile deletion is unavailable."));
    }
    return this.client.rpc<void>("delete_traveler_profile", {
      target_session_id: sessionId,
      target_profile_id: profileId,
      linked_trip_action: action,
      replacement_profile_id: replacementProfileId ?? null,
    });
  }

  async listTrips(sessionId: string, limit: number) {
    const result = await this.client.selectMany<TripRecord>({
      table: "trips",
      filters: [
        { column: "traveler_session_id", operator: "eq", value: sessionId },
        {
          column: "trip_status",
          operator: "in",
          value: ["draft", "active", "completed"],
        },
      ],
      orderBy: { column: "start_date", ascending: true },
      limit,
    });
    return result.ok ? success(result.value.map(this.mapTrip)) : result;
  }

  async findTrip(id: string) {
    const result = await this.client.selectOne<TripRecord>({
      table: "trips",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    return result.ok
      ? success(result.value ? this.mapTrip(result.value) : null)
      : result;
  }

  async findDay(id: string) {
    const result = await this.client.selectOne<DayRecord>({
      table: "itinerary_days",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    return result.ok
      ? success(
          result.value
            ? {
                id: result.value.id,
                tripId: result.value.trip_id,
                plannedDate: result.value.planned_date,
                dayOrder: result.value.day_order,
                notes: result.value.notes ?? undefined,
              }
            : null,
        )
      : result;
  }

  async findItem(id: string) {
    const result = await this.client.selectOne<ItemRecord>({
      table: "itinerary_items",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    return result.ok
      ? success(result.value ? this.mapItem(result.value) : null)
      : result;
  }

  async saveTrip(trip: TravelerTrip) {
    const result = await this.client.upsert<TripRecord, Record<string, unknown>>(
      "trips",
      {
        id: trip.id,
        traveler_session_id: trip.sessionId,
        title: trip.title,
        trip_status: trip.status,
        start_date: trip.startDate ?? null,
        end_date: trip.endDate ?? null,
        notes: trip.notes ?? null,
        destination: trip.destination ?? null,
        traveler_profile_id: trip.travelerProfileId ?? null,
        timezone: "Asia/Bangkok",
        data_classification: "real",
      },
      "id",
    );
    return result.ok ? success(this.mapTrip(result.value)) : result;
  }

  async deleteTrip(id: string, sessionId: string) {
    const result = await this.client.upsert<TripRecord, Record<string, unknown>>(
      "trips",
      { id, traveler_session_id: sessionId, trip_status: "deleted" },
      "id",
    );
    return result.ok ? success(undefined) : result;
  }

  async listSaved(sessionId: string, limit: number) {
    const result = await this.client.selectMany<SavedRecord>({
      table: "saved_places",
      filters: [{ column: "traveler_session_id", operator: "eq", value: sessionId }],
      orderBy: { column: "place_id", ascending: true },
      limit,
    });
    return result.ok
      ? success(
          result.value.map((row): TravelerSavedPlace => ({
            sessionId: row.traveler_session_id,
            placeId: row.place_id,
            tripId: row.trip_id ?? undefined,
          })),
        )
      : result;
  }

  async savePlace(record: TravelerSavedPlace) {
    const result = await this.client.upsert<SavedRecord, Record<string, unknown>>(
      "saved_places",
      {
        traveler_session_id: record.sessionId,
        place_id: record.placeId,
        trip_id: record.tripId ?? null,
      },
      "traveler_session_id,place_id,trip_id",
    );
    return result.ok ? success(undefined) : result;
  }

  deleteSaved(sessionId: string, placeId: string) {
    return this.client.deleteWhere("saved_places", [
      { column: "traveler_session_id", operator: "eq", value: sessionId },
      { column: "place_id", operator: "eq", value: placeId },
    ]);
  }

  async createReport(report: TravelerReport) {
    const result = await this.client.upsert<
      Record<string, unknown>,
      Record<string, unknown>
    >(
      "incorrect_information_reports",
      {
        id: report.id,
        reporter_session_id: report.sessionId,
        place_id: report.placeId,
        category: report.category,
        description: report.description,
        report_status: "open",
        priority: "normal",
        data_classification: "real",
      },
      "id",
    );
    return result.ok ? success(undefined) : result;
  }

  async saveItem(_sessionId: string, tripId: string, item: TravelerItineraryItem) {
    const day = await this.client.selectOne<DayRecord>({
      table: "itinerary_days",
      filters: [
        { column: "id", operator: "eq", value: item.dayId },
        { column: "trip_id", operator: "eq", value: tripId },
      ],
    });
    if (!day.ok) return day;
    if (!day.value) {
      return failure(appError("NOT_FOUND", "Itinerary day was not found."));
    }
    const result = await this.client.upsert<ItemRecord, Record<string, unknown>>(
      "itinerary_items",
      {
        id: item.id,
        itinerary_day_id: item.dayId,
        item_order: item.order,
        place_id: item.placeId ?? null,
        event_occurrence_id: item.eventOccurrenceId ?? null,
        notes: item.notes ?? null,
        planned_at: item.plannedAt ?? null,
        item_status: "confirmed",
        ai_generated: item.aiGenerated,
        data_classification: "real",
      },
      "id",
    );
    return result.ok ? success(this.mapItem(result.value)) : result;
  }

  async deleteItem(_sessionId: string, tripId: string, itemId: string) {
    const item = await this.client.selectOne<ItemRecord>({
      table: "itinerary_items",
      filters: [{ column: "id", operator: "eq", value: itemId }],
    });
    if (!item.ok) return item;
    if (!item.value) {
      return failure(appError("NOT_FOUND", "Itinerary item was not found."));
    }
    const day = await this.client.selectOne<DayRecord>({
      table: "itinerary_days",
      filters: [
        { column: "id", operator: "eq", value: item.value.itinerary_day_id },
        { column: "trip_id", operator: "eq", value: tripId },
      ],
    });
    if (!day.ok) return day;
    if (!day.value) {
      return failure(appError("NOT_FOUND", "Itinerary item was not found."));
    }
    return this.client.deleteWhere("itinerary_items", [
      { column: "id", operator: "eq", value: itemId },
    ]);
  }

  async listItems(sessionId: string, tripId: string) {
    const days = await this.listDays(sessionId, tripId);
    if (!days.ok) return days;
    if (days.value.length === 0) return success([] as readonly TravelerItineraryItem[]);
    const dayIds = days.value.map((d) => d.id);
    const result = await this.client.selectMany<ItemRecord>({
      table: "itinerary_items",
      filters: [{ column: "itinerary_day_id", operator: "in", value: dayIds }],
      orderBy: { column: "item_order", ascending: true },
    });
    return result.ok
      ? success(result.value.map((row): TravelerItineraryItem => this.mapItem(row)))
      : result;
  }

  async listDays(_sessionId: string, tripId: string) {
    const result = await this.client.selectMany<DayRecord>({
      table: "itinerary_days",
      filters: [{ column: "trip_id", operator: "eq", value: tripId }],
      orderBy: { column: "day_order", ascending: true },
    });
    return result.ok
      ? success(
          result.value.map((row): TravelerItineraryDay => ({
            id: row.id,
            tripId: row.trip_id,
            plannedDate: row.planned_date,
            dayOrder: row.day_order,
            notes: row.notes ?? undefined,
          })),
        )
      : result;
  }

  async saveDay(day: TravelerItineraryDay) {
    const result = await this.client.upsert<DayRecord, Record<string, unknown>>(
      "itinerary_days",
      {
        id: day.id,
        trip_id: day.tripId,
        planned_date: day.plannedDate,
        day_order: day.dayOrder,
        notes: day.notes ?? null,
      },
      "id",
    );
    return result.ok
      ? success({
          id: result.value.id,
          tripId: result.value.trip_id,
          plannedDate: result.value.planned_date,
          dayOrder: result.value.day_order,
          notes: result.value.notes ?? undefined,
        })
      : result;
  }

  async reorderItems(
    sessionId: string,
    tripId: string,
    dayId: string,
    orderedItemIds: readonly string[],
  ) {
    if (!this.client.rpc) {
      return failure(
        appError("UNAVAILABLE", "Atomic itinerary reorder is unavailable."),
      );
    }
    const result = await this.client.rpc<readonly ItemRecord[]>(
      "reorder_itinerary_items",
      {
        target_session_id: sessionId,
        target_trip_id: tripId,
        target_day_id: dayId,
        ordered_item_ids: orderedItemIds,
      },
    );
    return result.ok ? success(result.value.map((row) => this.mapItem(row))) : result;
  }

  async getPreferences(sessionId: string) {
    const result = await this.client.selectOne<SessionRecord>({
      table: "traveler_sessions",
      filters: [{ column: "id", operator: "eq", value: sessionId }],
    });
    if (!result.ok) return result;
    if (!result.value) {
      return failure(appError("NOT_FOUND", "Session was not found."));
    }
    const prefs = (result.value.traveler_preferences ??
      {}) as Partial<TravelerPreferences>;
    return success({
      transportation: prefs.transportation,
      travelStyle: prefs.travelStyle,
      companions: prefs.companions,
      activityLevel: prefs.activityLevel,
      budget: prefs.budget,
      language: prefs.language,
    } as TravelerPreferences);
  }

  async savePreferences(sessionId: string, preferences: TravelerPreferences) {
    const result = await this.client.upsert<SessionRecord, Record<string, unknown>>(
      "traveler_sessions",
      {
        id: sessionId,
        traveler_preferences: preferences as Record<string, unknown>,
      },
      "id",
    );
    return result.ok
      ? success((result.value.traveler_preferences ?? {}) as TravelerPreferences)
      : result;
  }

  private mapTrip(row: TripRecord): TravelerTrip {
    return {
      id: row.id,
      sessionId: row.traveler_session_id,
      title: row.title,
      status: row.trip_status,
      startDate: row.start_date ?? undefined,
      endDate: row.end_date ?? undefined,
      notes: row.notes ?? undefined,
      destination: row.destination ?? undefined,
      timezone: row.timezone,
      travelerProfileId: row.traveler_profile_id ?? undefined,
    };
  }

  private mapProfile(row: ProfileRecord): TravelerProfile {
    return {
      id: row.id,
      sessionId: row.traveler_session_id,
      name: row.profile_name,
      description: row.description ?? undefined,
      transportation: row.transportation ?? undefined,
      travelStyle: row.travel_style ?? undefined,
      companions: row.companions ?? undefined,
      activityLevel: row.activity_level ?? undefined,
      mobilityNeeds: row.mobility_needs ?? undefined,
      budget: row.budget_style ?? undefined,
      interests: row.preferred_interests ?? [],
      active: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? undefined,
    };
  }

  private mapItem(row: ItemRecord): TravelerItineraryItem {
    return {
      id: row.id,
      dayId: row.itinerary_day_id,
      order: row.item_order,
      placeId: row.place_id ?? undefined,
      eventOccurrenceId: row.event_occurrence_id ?? undefined,
      notes: row.notes ?? undefined,
      plannedAt: row.planned_at ? row.planned_at.slice(0, 5) : undefined,
      aiGenerated: row.ai_generated,
    };
  }
}
