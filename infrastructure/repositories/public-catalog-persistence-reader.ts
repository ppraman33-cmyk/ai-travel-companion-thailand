import type {
  PublicCatalogPage,
  PublicCatalogQuery,
  PublicCatalogReader,
  PublicCatalogRecord,
} from "@/application/public-api/contracts";
import type { PersistenceClient } from "@/infrastructure/supabase/persistence-client";
import type { PlaceRow } from "@/infrastructure/supabase/types";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

interface DestinationRow {
  readonly id: string;
  readonly name: string;
  readonly slug: string | null;
  readonly traveler_description: string | null;
  readonly history_summary: string | null;
  readonly geography_summary: string | null;
  readonly climate_summary: string | null;
  readonly capital_district_english_name: string | null;
  readonly area_square_km: number | null;
  readonly population: number | null;
  readonly province_motto: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly tags: readonly string[];
  readonly future_map_configuration: { readonly status?: string };
}

interface FoodRow {
  readonly id: string;
  readonly destination_id?: string;
  readonly canonical_thai_name: string;
  readonly category: string;
  readonly traveler_description?: string | null;
  readonly last_checked_at?: string | null;
}

interface EventRow {
  readonly id: string;
  readonly destination_id: string;
  readonly canonical_thai_name: string;
  readonly event_category: string;
  readonly last_checked_at: string | null;
}

interface OccurrenceRow {
  readonly id: string;
  readonly destination_id: string;
  readonly starts_at: string;
  readonly ends_at: string | null;
}

interface EmergencyRow {
  readonly place_id: string;
  readonly destination_id: string;
  readonly address_summary: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly official_thai_name: string;
  readonly reviewed_english_name: string;
  readonly emergency_category: string;
  readonly verified_at: string;
}

export class PublicCatalogPersistenceReader implements PublicCatalogReader {
  constructor(private readonly client: PersistenceClient) {}

  async read(query: PublicCatalogQuery) {
    if (query.kind === "search") {
      return this.readSearch(query);
    }
    if (
      query.kind === "places" ||
      query.kind === "restaurants" ||
      query.kind === "attractions"
    ) {
      return this.readPlaces(query);
    }

    const table = {
      destinations: "destinations",
      foods: "public_food_specialty_catalog",
      events: "events",
      "event-occurrences": "event_occurrences",
      "emergency-services": "public_emergency_catalog",
    }[query.kind] as
      | "destinations"
      | "public_food_specialty_catalog"
      | "events"
      | "event_occurrences"
      | "public_emergency_catalog"
      | undefined;

    if (!table) {
      return failure(appError("VALIDATION", "Unsupported catalog area."));
    }

    const filters = [
      ...(query.id
        ? [
            {
              column: table === "public_emergency_catalog" ? "place_id" : "id",
              operator: "eq" as const,
              value: query.id,
            },
          ]
        : []),
      ...(query.cursor
        ? [
            {
              column: table === "public_emergency_catalog" ? "place_id" : "id",
              operator: "gt" as const,
              value: query.cursor,
            },
          ]
        : []),
      ...(query.destinationId && table !== "destinations"
        ? [
            {
              column: "destination_id",
              operator: "eq" as const,
              value: query.destinationId,
            },
          ]
        : []),
      ...(query.category
        ? [
            {
              column:
                table === "public_food_specialty_catalog"
                  ? "category"
                  : table === "events"
                    ? "event_category"
                    : table === "public_emergency_catalog"
                      ? "emergency_category"
                      : "id",
              operator: "eq" as const,
              value: query.category,
            },
          ]
        : []),
      ...(table === "event_occurrences" && query.activeFrom
        ? [{ column: "starts_at", operator: "gte" as const, value: query.activeFrom }]
        : []),
      ...(table === "event_occurrences" && query.activeUntil
        ? [{ column: "starts_at", operator: "lte" as const, value: query.activeUntil }]
        : []),
    ];
    const result = await this.client.selectMany<
      DestinationRow | FoodRow | EventRow | OccurrenceRow | EmergencyRow
    >({
      table,
      columns: this.publicColumns(table),
      filters,
      orderBy: {
        column:
          table === "event_occurrences"
            ? "starts_at"
            : table === "public_emergency_catalog"
              ? "place_id"
              : "id",
        ascending: true,
      },
      limit: query.limit + 1,
    });
    if (!result.ok) return result;
    const pageRows = result.value.slice(0, query.limit);
    const items = pageRows.map((row) => this.mapRow(query.kind, row));
    const overflow = result.value.length > query.limit;
    return success({
      items,
      nextCursor: overflow ? this.rowId(pageRows.at(-1)) : undefined,
    } satisfies PublicCatalogPage);
  }

  private async readPlaces(query: PublicCatalogQuery) {
    const category =
      query.kind === "restaurants"
        ? "restaurant"
        : query.kind === "attractions"
          ? "attraction"
          : query.category;
    const result = await this.client.selectMany<PlaceRow>({
      table: "places",
      columns: this.publicColumns("places"),
      filters: [
        ...(query.id
          ? [{ column: "id", operator: "eq" as const, value: query.id }]
          : []),
        ...(query.cursor
          ? [{ column: "id", operator: "gt" as const, value: query.cursor }]
          : []),
        ...(query.destinationId
          ? [
              {
                column: "destination_id",
                operator: "eq" as const,
                value: query.destinationId,
              },
            ]
          : []),
        ...(category
          ? [{ column: "place_category", operator: "eq" as const, value: category }]
          : []),
        ...(query.districtId
          ? [
              {
                column: "district_geography_id",
                operator: "eq" as const,
                value: query.districtId,
              },
            ]
          : []),
        ...(query.keyword
          ? [
              {
                column: "normalized_search_name",
                operator: "ilike" as const,
                value: this.searchPattern(query.keyword),
              },
            ]
          : []),
      ],
      orderBy: { column: "id", ascending: true },
      limit: query.limit + 1,
    });
    if (!result.ok) return result;
    const pageRows = result.value.slice(0, query.limit);
    return success({
      items: pageRows.map((row): PublicCatalogRecord => ({
        id: row.id,
        kind: query.kind,
        name: row.default_english_name ?? row.canonical_thai_name,
        canonicalThaiName: row.canonical_thai_name,
        destinationId: row.destination_id,
        category: row.place_category,
        address: row.address_summary,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        informationCheckedAt: row.last_checked_at ?? undefined,
      })),
      nextCursor: result.value.length > query.limit ? pageRows.at(-1)?.id : undefined,
    });
  }

  private mapRow(
    kind: PublicCatalogQuery["kind"],
    row: DestinationRow | FoodRow | EventRow | OccurrenceRow | EmergencyRow,
  ): PublicCatalogRecord {
    if ("name" in row) {
      return {
        id: row.id,
        kind,
        name: row.name,
        slug: row.slug ?? undefined,
        description: row.traveler_description ?? undefined,
        history: row.history_summary ?? undefined,
        geography: row.geography_summary ?? undefined,
        climate: row.climate_summary ?? undefined,
        capitalDistrict: row.capital_district_english_name ?? undefined,
        areaSquareKm:
          row.area_square_km === null ? undefined : Number(row.area_square_km),
        population: row.population ?? undefined,
        provinceMotto: row.province_motto ?? undefined,
        latitude: row.latitude === null ? undefined : Number(row.latitude),
        longitude: row.longitude === null ? undefined : Number(row.longitude),
        tags: row.tags,
        futureMapStatus:
          row.future_map_configuration.status === "coming_soon"
            ? "coming_soon"
            : undefined,
      };
    }
    if ("reviewed_english_name" in row) {
      return {
        id: row.place_id,
        kind,
        name: row.reviewed_english_name,
        canonicalThaiName: row.official_thai_name,
        category: row.emergency_category,
        destinationId: row.destination_id,
        address: row.address_summary,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        informationCheckedAt: row.verified_at,
      };
    }
    if ("starts_at" in row) {
      return {
        id: row.id,
        kind,
        name: "Scheduled event occurrence",
        destinationId: row.destination_id,
        startsAt: row.starts_at,
        endsAt: row.ends_at ?? undefined,
      };
    }
    if ("event_category" in row) {
      return {
        id: row.id,
        kind,
        name: row.canonical_thai_name,
        canonicalThaiName: row.canonical_thai_name,
        destinationId: row.destination_id,
        category: row.event_category,
        informationCheckedAt: row.last_checked_at ?? undefined,
      };
    }
    return {
      id: row.id,
      kind,
      name: row.canonical_thai_name,
      canonicalThaiName: row.canonical_thai_name,
      category: row.category,
      destinationId: row.destination_id,
      summary: row.traveler_description ?? undefined,
      informationCheckedAt: row.last_checked_at ?? undefined,
    };
  }

  private async readSearch(query: PublicCatalogQuery) {
    if (!query.keyword) {
      return failure(appError("VALIDATION", "A search keyword is required."));
    }
    const perKindLimit = Math.min(query.limit, 20);
    const pattern = this.searchPattern(query.keyword);
    const [places, foods, events] = await Promise.all([
      this.client.selectMany<PlaceRow>({
        table: "places",
        columns: this.publicColumns("places"),
        filters: [
          { column: "normalized_search_name", operator: "ilike", value: pattern },
          ...(query.destinationId
            ? [
                {
                  column: "destination_id",
                  operator: "eq" as const,
                  value: query.destinationId,
                },
              ]
            : []),
          ...(query.districtId
            ? [
                {
                  column: "district_geography_id",
                  operator: "eq" as const,
                  value: query.districtId,
                },
              ]
            : []),
          ...(query.category
            ? [
                {
                  column: "place_category",
                  operator: "eq" as const,
                  value: query.category,
                },
              ]
            : []),
        ],
        orderBy: { column: "normalized_search_name", ascending: true },
        limit: perKindLimit,
      }),
      this.client.selectMany<FoodRow>({
        table: "public_food_specialty_catalog",
        columns: this.publicColumns("public_food_specialty_catalog"),
        filters: [
          { column: "normalized_name", operator: "ilike", value: pattern },
          ...(query.destinationId
            ? [
                {
                  column: "destination_id",
                  operator: "eq" as const,
                  value: query.destinationId,
                },
              ]
            : []),
          ...(query.category
            ? [{ column: "category", operator: "eq" as const, value: query.category }]
            : []),
        ],
        orderBy: { column: "normalized_name", ascending: true },
        limit: perKindLimit,
      }),
      this.client.selectMany<EventRow>({
        table: "events",
        columns: this.publicColumns("events"),
        filters: [
          { column: "normalized_name", operator: "ilike", value: pattern },
          ...(query.destinationId
            ? [
                {
                  column: "destination_id",
                  operator: "eq" as const,
                  value: query.destinationId,
                },
              ]
            : []),
          ...(query.category
            ? [
                {
                  column: "event_category",
                  operator: "eq" as const,
                  value: query.category,
                },
              ]
            : []),
        ],
        orderBy: { column: "normalized_name", ascending: true },
        limit: perKindLimit,
      }),
    ]);
    const failed = [places, foods, events].find((result) => !result.ok);
    if (failed && !failed.ok) return failed;
    const placeItems = places.ok
      ? places.value.map((row): PublicCatalogRecord => ({
          id: row.id,
          kind: row.place_category === "restaurant" ? "restaurants" : "places",
          name: row.default_english_name ?? row.canonical_thai_name,
          canonicalThaiName: row.canonical_thai_name,
          destinationId: row.destination_id,
          category: row.place_category,
          address: row.address_summary,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          informationCheckedAt: row.last_checked_at ?? undefined,
        }))
      : [];
    const foodItems = foods.ok
      ? foods.value.map((row) => this.mapRow("foods", row))
      : [];
    const eventItems = events.ok
      ? events.value.map((row) => this.mapRow("events", row))
      : [];
    const items = [...placeItems, ...foodItems, ...eventItems]
      .sort((left, right) => left.name.localeCompare(right.name, "en"))
      .slice(0, query.limit);
    return success({ items });
  }

  private searchPattern(keyword: string) {
    const normalized = keyword
      .trim()
      .toLocaleLowerCase("en")
      .replaceAll(/[%_\\]/g, "")
      .replaceAll(/\s+/g, " ");
    return `%${normalized}%`;
  }

  private publicColumns(table: string): readonly string[] {
    const columns: Readonly<Record<string, readonly string[]>> = {
      destinations: [
        "id",
        "name",
        "slug",
        "traveler_description",
        "history_summary",
        "geography_summary",
        "climate_summary",
        "capital_district_english_name",
        "area_square_km",
        "population",
        "province_motto",
        "latitude",
        "longitude",
        "tags",
        "future_map_configuration",
      ],
      places: [
        "id",
        "destination_id",
        "canonical_thai_name",
        "default_english_name",
        "normalized_search_name",
        "address_summary",
        "latitude",
        "longitude",
        "place_category",
        "last_checked_at",
        "district_geography_id",
      ],
      public_food_specialty_catalog: [
        "id",
        "destination_id",
        "canonical_thai_name",
        "normalized_name",
        "category",
        "traveler_description",
        "last_checked_at",
      ],
      events: [
        "id",
        "destination_id",
        "canonical_thai_name",
        "normalized_name",
        "event_category",
        "last_checked_at",
      ],
      event_occurrences: ["id", "destination_id", "starts_at", "ends_at"],
      public_emergency_catalog: [
        "place_id",
        "destination_id",
        "address_summary",
        "latitude",
        "longitude",
        "official_thai_name",
        "reviewed_english_name",
        "emergency_category",
        "verified_at",
      ],
    };
    return columns[table] ?? ["id"];
  }

  private rowId(
    row: DestinationRow | FoodRow | EventRow | OccurrenceRow | EmergencyRow | undefined,
  ) {
    return row && ("id" in row ? row.id : row.place_id);
  }
}
