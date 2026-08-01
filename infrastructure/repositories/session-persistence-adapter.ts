import type {
  AnonymousSessionRecord,
  AnonymousSessionRepository,
} from "@/application/public-api/contracts";
import type { PersistenceClient } from "@/infrastructure/supabase/persistence-client";
import { success } from "@/shared/result/result";

interface TravelerSessionRow {
  readonly id: string;
  readonly session_secret_hash: string;
  readonly locale: string;
  readonly expires_at: string;
  readonly revoked_at: string | null;
}

interface TravelerSessionInsert extends TravelerSessionRow {
  readonly destination_id: null;
  readonly privacy_consent_state: Readonly<Record<string, never>>;
  readonly data_classification: "real";
  readonly created_at: string;
  readonly last_activity_at: string;
  readonly deleted_at: null;
}

export class SessionPersistenceAdapter implements AnonymousSessionRepository {
  constructor(private readonly client: PersistenceClient) {}

  async create(record: AnonymousSessionRecord) {
    const now = new Date().toISOString();
    const input: TravelerSessionInsert = {
      id: record.id,
      session_secret_hash: record.secretHash,
      locale: record.locale,
      expires_at: record.expiresAt,
      revoked_at: null,
      destination_id: null,
      privacy_consent_state: {},
      data_classification: "real",
      created_at: now,
      last_activity_at: now,
      deleted_at: null,
    };
    const result = await this.client.upsert<TravelerSessionRow, TravelerSessionInsert>(
      "traveler_sessions",
      input,
      "id",
    );
    return result.ok ? success(undefined) : result;
  }

  async findBySecretHash(hash: string) {
    const result = await this.client.selectOne<TravelerSessionRow>({
      table: "traveler_sessions",
      filters: [{ column: "session_secret_hash", operator: "eq", value: hash }],
    });
    return result.ok
      ? success(
          result.value
            ? {
                id: result.value.id,
                secretHash: result.value.session_secret_hash,
                locale: result.value.locale,
                expiresAt: result.value.expires_at,
                revokedAt: result.value.revoked_at ?? undefined,
              }
            : null,
        )
      : result;
  }

  async revoke(id: string) {
    const current = await this.client.selectOne<TravelerSessionRow>({
      table: "traveler_sessions",
      filters: [{ column: "id", operator: "eq", value: id }],
    });
    if (!current.ok) return current;
    if (!current.value) return success(undefined);
    const result = await this.client.upsert<
      TravelerSessionRow,
      Partial<TravelerSessionRow> & { id: string }
    >("traveler_sessions", { id, revoked_at: new Date().toISOString() }, "id");
    return result.ok ? success(undefined) : result;
  }
}
