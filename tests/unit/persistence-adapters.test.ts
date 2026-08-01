import { describe, expect, it } from "vitest";

import {
  PlacePersistenceAdapter,
  TripPersistenceAdapter,
} from "@/infrastructure/repositories/persistence-adapters";
import type {
  PersistenceClient,
  PersistenceQuery,
  PersistenceTable,
} from "@/infrastructure/supabase/persistence-client";
import type { PlaceRow } from "@/infrastructure/supabase/types";
import type { AppError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

class FakePersistenceClient implements PersistenceClient {
  constructor(
    private readonly rows: Readonly<Record<string, readonly unknown[]>>,
    private readonly error?: AppError,
  ) {}

  async selectOne<Row>(query: PersistenceQuery): Promise<Result<Row | null, AppError>> {
    if (this.error) return failure(this.error);
    return success((this.rows[query.table]?.[0] as Row | undefined) ?? null);
  }

  async selectMany<Row>(
    query: PersistenceQuery,
  ): Promise<Result<readonly Row[], AppError>> {
    if (this.error) return failure(this.error);
    return success((this.rows[query.table] as readonly Row[] | undefined) ?? []);
  }

  async upsert<Row, Input>(
    table: PersistenceTable,
    input: Input,
  ): Promise<Result<Row, AppError>> {
    if (this.error) return failure(this.error);
    return success(input as unknown as Row);
  }

  async deleteWhere(): Promise<Result<void, AppError>> {
    if (this.error) return failure(this.error);
    return success(undefined);
  }
}

const placeRow: PlaceRow = {
  id: "synthetic-place",
  destination_id: "synthetic-destination",
  geography_id: "synthetic-geography",
  canonical_thai_name: "สถานที่ทดสอบ",
  default_english_name: "TEST DATA — Adapter Place",
  normalized_search_name: "test data adapter place",
  address_summary: "TEST DATA",
  latitude: 0,
  longitude: 0,
  place_category: "attraction",
  operating_status: "operating",
  publication_status: "approved",
  verification_status: "verified",
  data_classification: "synthetic",
  last_checked_at: null,
  stale_at: null,
  suppressed_at: null,
  suppression_reason: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  archived_at: null,
};

describe("persistence adapters", () => {
  it("maps database Place rows without leaking database field names", async () => {
    const adapter = new PlacePersistenceAdapter(
      new FakePersistenceClient({
        places: [placeRow],
        place_assertions: [{ assertion_id: "synthetic-source" }],
        source_assertions: [{ source_id: "synthetic-source-record" }],
        place_media: [{ media_asset_id: "synthetic-media" }],
        place_verifications: [{ verification_id: "synthetic-verification" }],
      }),
    );

    const result = await adapter.findById(placeRow.id);
    expect(result).toEqual(
      success({
        id: "synthetic-place",
        dataClassification: "synthetic",
        subtype: "attraction",
        name: "TEST DATA — Adapter Place",
        location: { latitude: 0, longitude: 0 },
        sourceIds: ["synthetic-source-record"],
        mediaAssetIds: ["synthetic-media"],
        verificationId: "synthetic-verification",
      }),
    );
    expect(result.ok && result.value !== null && "destination_id" in result.value).toBe(
      false,
    );
  });

  it("maps persistence failures to the shared error result unchanged", async () => {
    const expected: AppError = {
      code: "PERMISSION",
      message: "Denied",
      retryable: false,
    };
    const adapter = new PlacePersistenceAdapter(
      new FakePersistenceClient({}, expected),
    );
    expect(await adapter.findById("synthetic-place")).toEqual(failure(expected));
  });

  it("injects classification when saving an anonymous-session Trip", async () => {
    const adapter = new TripPersistenceAdapter(
      new FakePersistenceClient({}),
      "synthetic",
    );
    const result = await adapter.save({
      id: "synthetic-trip",
      travelerSessionId: "synthetic-session",
      title: "TEST DATA",
    });
    expect(result).toEqual(
      success({
        id: "synthetic-trip",
        travelerSessionId: "synthetic-session",
        title: "TEST DATA",
      }),
    );
  });
});
