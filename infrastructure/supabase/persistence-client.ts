import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export type PersistenceTable =
  | "places"
  | "trips"
  | "emergency_service_profiles"
  | "media_assets"
  | "sources"
  | "source_assertions"
  | "verifications"
  | "place_assertions"
  | "place_media"
  | "place_verifications"
  | "destinations"
  | "food_specialties"
  | "public_food_specialty_catalog"
  | "public_emergency_catalog"
  | "events"
  | "event_occurrences"
  | "traveler_sessions"
  | "itinerary_days"
  | "itinerary_items"
  | "saved_places"
  | "incorrect_information_reports";

export interface PersistenceFilter {
  readonly column: string;
  readonly operator: "eq" | "in" | "gt" | "gte" | "lte" | "is" | "ilike";
  readonly value: unknown;
}

export interface PersistenceQuery {
  readonly table: PersistenceTable;
  readonly columns?: readonly string[];
  readonly filters?: readonly PersistenceFilter[];
  readonly orderBy?: Readonly<{
    column: string;
    ascending: boolean;
  }>;
  readonly limit?: number;
}

export interface PersistenceClient {
  selectOne<Row>(query: PersistenceQuery): Promise<Result<Row | null, AppError>>;
  selectMany<Row>(query: PersistenceQuery): Promise<Result<readonly Row[], AppError>>;
  upsert<Row, Input>(
    table: PersistenceTable,
    input: Input,
    conflictColumn: string,
  ): Promise<Result<Row, AppError>>;
  deleteWhere(
    table: PersistenceTable,
    filters: readonly PersistenceFilter[],
  ): Promise<Result<void, AppError>>;
  rpc?<Row>(
    functionName: string,
    parameters: Readonly<Record<string, unknown>>,
  ): Promise<Result<Row, AppError>>;
}
