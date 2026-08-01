import type {
  TravelerReport,
  TravelerRepository,
  TravelerSavedPlace,
  TravelerTrip,
  TravelerItineraryItem,
} from "@/application/public-api/traveler-service";
import type { PersistenceClient } from "@/infrastructure/supabase/persistence-client";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

interface TripRecord {
  readonly id: string;
  readonly traveler_session_id: string;
  readonly title: string;
  readonly trip_status: TravelerTrip["status"];
}

interface SavedRecord {
  readonly traveler_session_id: string;
  readonly place_id: string;
  readonly trip_id: string | null;
}

interface DayRecord {
  readonly id: string;
  readonly trip_id: string;
}

interface ItemRecord {
  readonly id: string;
  readonly itinerary_day_id: string;
  readonly item_order: number;
  readonly place_id: string | null;
  readonly event_occurrence_id: string | null;
  readonly notes: string | null;
  readonly ai_generated: boolean;
}

export class TravelerPersistenceAdapter implements TravelerRepository {
  constructor(private readonly client: PersistenceClient) {}

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
      orderBy: { column: "id", ascending: true },
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

  async saveTrip(trip: TravelerTrip) {
    const result = await this.client.upsert<TripRecord, Record<string, unknown>>(
      "trips",
      {
        id: trip.id,
        traveler_session_id: trip.sessionId,
        title: trip.title,
        trip_status: trip.status,
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
      return {
        ok: false as const,
        error: {
          code: "NOT_FOUND" as const,
          message: "Itinerary day was not found.",
          retryable: false,
        },
      };
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
        item_status: "confirmed",
        ai_generated: item.aiGenerated,
        data_classification: "real",
      },
      "id",
    );
    return result.ok
      ? success({
          id: result.value.id,
          dayId: result.value.itinerary_day_id,
          order: result.value.item_order,
          placeId: result.value.place_id ?? undefined,
          eventOccurrenceId: result.value.event_occurrence_id ?? undefined,
          notes: result.value.notes ?? undefined,
          aiGenerated: result.value.ai_generated,
        })
      : result;
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

  private mapTrip(row: TripRecord): TravelerTrip {
    return {
      id: row.id,
      sessionId: row.traveler_session_id,
      title: row.title,
      status: row.trip_status,
    };
  }
}
