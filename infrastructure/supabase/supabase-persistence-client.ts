import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  parsePublicDatabaseClientConfig,
  parseServiceDatabaseClientConfig,
  type PublicDatabaseClientConfig,
  type ServiceDatabaseClientConfig,
} from "@/infrastructure/supabase/config";
import type {
  PersistenceClient,
  PersistenceFilter,
  PersistenceQuery,
  PersistenceTable,
} from "@/infrastructure/supabase/persistence-client";
import type { Database } from "@/infrastructure/supabase/types";
import { appError, type AppError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

type UntypedQuery = {
  eq(column: string, value: unknown): UntypedQuery;
  gt(column: string, value: unknown): UntypedQuery;
  in(column: string, values: readonly unknown[]): UntypedQuery;
  gte(column: string, value: unknown): UntypedQuery;
  lte(column: string, value: unknown): UntypedQuery;
  is(column: string, value: unknown): UntypedQuery;
  ilike(column: string, value: string): UntypedQuery;
  order(column: string, options: { ascending: boolean }): UntypedQuery;
  limit(value: number): UntypedQuery;
  delete(): UntypedQuery;
  maybeSingle(): PromiseLike<{ data: unknown; error: SupabaseErrorLike | null }>;
  single(): PromiseLike<{ data: unknown; error: SupabaseErrorLike | null }>;
  then<TResult1 = { data: unknown; error: SupabaseErrorLike | null }>(
    onfulfilled?: (value: {
      data: unknown;
      error: SupabaseErrorLike | null;
    }) => TResult1 | PromiseLike<TResult1>,
  ): PromiseLike<TResult1>;
};

interface SupabaseErrorLike {
  readonly code?: string;
  readonly message: string;
}

const applyFilter = (query: UntypedQuery, filter: PersistenceFilter): UntypedQuery => {
  if (filter.operator === "in") {
    return query.in(filter.column, filter.value as readonly unknown[]);
  }
  if (filter.operator === "ilike") {
    return query.ilike(filter.column, String(filter.value));
  }
  return query[filter.operator](filter.column, filter.value);
};

const mapDatabaseError = (error: SupabaseErrorLike): AppError => {
  if (error.code === "23505") {
    return appError(
      "CONFLICT",
      "The persistence operation conflicts with existing data.",
    );
  }
  if (error.code === "23503" || error.code === "23514" || error.code === "22P02") {
    return appError(
      "VALIDATION",
      "The persistence operation violates a data constraint.",
    );
  }
  if (error.code === "42501") {
    return appError("PERMISSION", "The persistence operation is not permitted.");
  }
  return appError(
    "PROVIDER",
    "The persistence provider could not complete the operation.",
    {
      retryable: true,
      metadata: { databaseCode: error.code ?? "unknown" },
    },
  );
};

export class SupabasePersistenceClient implements PersistenceClient {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async selectOne<Row>(query: PersistenceQuery): Promise<Result<Row | null, AppError>> {
    const response = await this.buildSelect(query).maybeSingle();
    return response.error
      ? failure(mapDatabaseError(response.error))
      : success((response.data as Row | null) ?? null);
  }

  async selectMany<Row>(
    query: PersistenceQuery,
  ): Promise<Result<readonly Row[], AppError>> {
    const response = await this.buildSelect(query);
    return response.error
      ? failure(mapDatabaseError(response.error))
      : success((response.data as readonly Row[] | null) ?? []);
  }

  async upsert<Row, Input>(
    table: PersistenceTable,
    input: Input,
    conflictColumn: string,
  ): Promise<Result<Row, AppError>> {
    const response = await (
      this.client
        .from(table)
        .upsert(input as never, { onConflict: conflictColumn })
        .select() as unknown as UntypedQuery
    ).single();

    return response.error
      ? failure(mapDatabaseError(response.error))
      : success(response.data as Row);
  }

  async deleteWhere(
    table: PersistenceTable,
    filters: readonly PersistenceFilter[],
  ): Promise<Result<void, AppError>> {
    let query = this.client.from(table).delete() as unknown as UntypedQuery;
    for (const filter of filters) {
      query = applyFilter(query, filter);
    }
    const response = await query;
    return response.error
      ? failure(mapDatabaseError(response.error))
      : success(undefined);
  }

  async rpc<Row>(
    functionName: string,
    parameters: Readonly<Record<string, unknown>>,
  ): Promise<Result<Row, AppError>> {
    const response = await this.client.rpc(functionName as never, parameters as never);
    return response.error
      ? failure(mapDatabaseError(response.error))
      : success(response.data as Row);
  }

  private buildSelect(query: PersistenceQuery): UntypedQuery {
    let builder = this.client
      .from(query.table)
      .select(query.columns?.join(",") ?? "*") as unknown as UntypedQuery;
    for (const filter of query.filters ?? []) {
      builder = applyFilter(builder, filter);
    }
    if (query.orderBy) {
      builder = builder.order(query.orderBy.column, {
        ascending: query.orderBy.ascending,
      });
    }
    return query.limit ? builder.limit(query.limit) : builder;
  }
}

export const createPublicPersistenceClient = (
  input: PublicDatabaseClientConfig,
): PersistenceClient => {
  const config = parsePublicDatabaseClientConfig(input);
  return new SupabasePersistenceClient(
    createClient<Database>(config.url, config.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  );
};

export const createServicePersistenceClient = (
  input: ServiceDatabaseClientConfig,
): PersistenceClient => {
  if (typeof window !== "undefined") {
    throw new Error("Service-role database clients are server-only.");
  }
  const config = parseServiceDatabaseClientConfig(input);
  return new SupabasePersistenceClient(
    createClient<Database>(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  );
};
