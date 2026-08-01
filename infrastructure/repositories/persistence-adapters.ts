import type {
  EmergencyRepository,
  MediaRepository,
  PlaceRepository,
  SourceRepository,
  TripRepository,
  VerificationRepository,
} from "@/domain/repositories";
import {
  mapEmergencyRows,
  mapMediaRow,
  mapPlaceRow,
  mapSourceRow,
  mapTripRow,
  mapVerificationRow,
  type PlaceRelations,
} from "@/infrastructure/repositories/mappers";
import type { PersistenceClient } from "@/infrastructure/supabase/persistence-client";
import type {
  DataClassificationRow,
  EmergencyProfileRow,
  MediaAssetRow,
  PlaceRow,
  SourceRow,
  TripInsert,
  TripRow,
  VerificationRow,
} from "@/infrastructure/supabase/types";
import { appError, type AppError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

interface IdLinkRow {
  readonly assertion_id?: string;
  readonly media_asset_id?: string;
  readonly verification_id?: string;
}

interface AssertionSourceRow {
  readonly source_id: string;
}

export class PlacePersistenceAdapter implements PlaceRepository {
  constructor(private readonly client: PersistenceClient) {}

  async findById(id: string) {
    const row = await this.client.selectOne<PlaceRow>({
      table: "places",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    if (!row.ok) return failure(row.error);
    if (row.value === null) return success(null);
    const relations = await this.loadRelations(id);
    return relations.ok ? mapPlaceRow(row.value, relations.value) : relations;
  }

  async findByIds(ids: readonly string[]) {
    if (ids.length === 0) {
      return success([]);
    }
    const rows = await this.client.selectMany<PlaceRow>({
      table: "places",
      filters: [{ column: "id", operator: "in", value: ids }],
      orderBy: { column: "id", ascending: true },
      limit: ids.length,
    });
    if (!rows.ok) {
      return rows;
    }
    const mapped = [];
    for (const row of rows.value) {
      const relations = await this.loadRelations(row.id);
      if (!relations.ok) {
        return relations;
      }
      const place = mapPlaceRow(row, relations.value);
      if (!place.ok) {
        return place;
      }
      mapped.push(place.value);
    }
    return success(mapped);
  }

  private async loadRelations(
    placeId: string,
  ): Promise<Result<PlaceRelations, AppError>> {
    const [assertions, media, verifications] = await Promise.all([
      this.client.selectMany<IdLinkRow>({
        table: "place_assertions",
        filters: [{ column: "place_id", operator: "eq", value: placeId }],
      }),
      this.client.selectMany<IdLinkRow>({
        table: "place_media",
        filters: [{ column: "place_id", operator: "eq", value: placeId }],
      }),
      this.client.selectMany<IdLinkRow>({
        table: "place_verifications",
        filters: [{ column: "place_id", operator: "eq", value: placeId }],
        limit: 1,
      }),
    ]);
    if (!assertions.ok) return assertions;
    if (!media.ok) return media;
    if (!verifications.ok) return verifications;
    const assertionIds = assertions.value.flatMap((row) =>
      row.assertion_id ? [row.assertion_id] : [],
    );
    const assertionSources =
      assertionIds.length === 0
        ? success<readonly AssertionSourceRow[]>([])
        : await this.client.selectMany<AssertionSourceRow>({
            table: "source_assertions",
            filters: [{ column: "id", operator: "in", value: assertionIds }],
          });
    if (!assertionSources.ok) return assertionSources;
    const verificationId = verifications.value[0]?.verification_id;
    if (!verificationId) {
      return failure(
        appError("VALIDATION", "Place persistence data lacks verification."),
      );
    }
    return success({
      sourceIds: assertionSources.value.map((row) => row.source_id),
      mediaAssetIds: media.value.flatMap((row) =>
        row.media_asset_id ? [row.media_asset_id] : [],
      ),
      verificationId,
    });
  }
}

export class TripPersistenceAdapter implements TripRepository {
  constructor(
    private readonly client: PersistenceClient,
    private readonly dataClassification: DataClassificationRow,
  ) {}

  async findById(id: string) {
    const result = await this.client.selectOne<TripRow>({
      table: "trips",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    return result.ok ? success(result.value ? mapTripRow(result.value) : null) : result;
  }

  async save(trip: {
    readonly id: string;
    readonly travelerSessionId: string;
    readonly title: string;
  }) {
    const input: TripInsert = {
      id: trip.id,
      traveler_session_id: trip.travelerSessionId,
      title: trip.title,
      start_date: null,
      end_date: null,
      timezone: "Asia/Bangkok",
      trip_status: "draft",
      notes: null,
      data_classification: this.dataClassification,
    };
    const result = await this.client.upsert<TripRow, TripInsert>("trips", input, "id");
    return result.ok ? success(mapTripRow(result.value)) : result;
  }
}

export class EmergencyPersistenceAdapter implements EmergencyRepository {
  private readonly places: PlacePersistenceAdapter;

  constructor(private readonly client: PersistenceClient) {
    this.places = new PlacePersistenceAdapter(client);
  }

  async findVerifiedNearby(location: {
    readonly latitude: number;
    readonly longitude: number;
  }) {
    const delta = 0.25;
    const rows = await this.client.selectMany<PlaceRow>({
      table: "places",
      filters: [
        { column: "place_category", operator: "eq", value: "emergency_service" },
        { column: "publication_status", operator: "eq", value: "published" },
        { column: "latitude", operator: "gte", value: location.latitude - delta },
        { column: "latitude", operator: "lte", value: location.latitude + delta },
        { column: "longitude", operator: "gte", value: location.longitude - delta },
        { column: "longitude", operator: "lte", value: location.longitude + delta },
      ],
      orderBy: { column: "id", ascending: true },
      limit: 20,
    });
    if (!rows.ok) return rows;

    const services = [];
    for (const row of rows.value) {
      const place = await this.places.findById(row.id);
      if (!place.ok) return place;
      if (!place.value) continue;
      const profile = await this.client.selectOne<EmergencyProfileRow>({
        table: "emergency_service_profiles",
        filters: [
          { column: "place_id", operator: "eq", value: row.id },
          { column: "publication_eligible", operator: "eq", value: true },
          { column: "suppression_status", operator: "eq", value: "not_suppressed" },
        ],
      });
      if (!profile.ok) return profile;
      if (!profile.value || new Date(profile.value.stale_at) <= new Date()) continue;
      const mapped = mapEmergencyRows(place.value, profile.value);
      if (!mapped.ok) return mapped;
      services.push(mapped.value);
    }
    return success(services);
  }
}

export class MediaPersistenceAdapter implements MediaRepository {
  constructor(private readonly client: PersistenceClient) {}
  async findByIds(ids: readonly string[]) {
    if (ids.length === 0) return success([]);
    const result = await this.client.selectMany<MediaAssetRow>({
      table: "media_assets",
      filters: [
        { column: "id", operator: "in", value: ids },
        { column: "takedown_status", operator: "eq", value: "clear" },
      ],
      orderBy: { column: "id", ascending: true },
      limit: ids.length,
    });
    return result.ok ? success(result.value.map(mapMediaRow)) : result;
  }
}

export class SourcePersistenceAdapter implements SourceRepository {
  constructor(private readonly client: PersistenceClient) {}
  async findByIds(ids: readonly string[]) {
    if (ids.length === 0) return success([]);
    const result = await this.client.selectMany<SourceRow>({
      table: "sources",
      filters: [{ column: "id", operator: "in", value: ids }],
      orderBy: { column: "id", ascending: true },
      limit: ids.length,
    });
    return result.ok ? success(result.value.map(mapSourceRow)) : result;
  }
}

export class VerificationPersistenceAdapter implements VerificationRepository {
  constructor(private readonly client: PersistenceClient) {}
  async findById(id: string) {
    const result = await this.client.selectOne<VerificationRow>({
      table: "verifications",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    return result.ok
      ? success(result.value ? mapVerificationRow(result.value) : null)
      : result;
  }
}
