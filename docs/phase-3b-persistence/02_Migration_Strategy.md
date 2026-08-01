# Migration Strategy

## Ordered migrations

1. Extensions, shared enums, and common timestamp/publication functions
2. Geography, destinations, common Place identity, translations, and admin identity
3. Restaurant, attraction, Food, Events, occurrences, and opening hours
4. Sources, assertions, verification, rights, media, contacts, and emergency safety
5. Anonymous sessions, Trips, itinerary, saves, AI accounting, reports, and audit
6. Ownership helpers, RLS policies, publication queries, and indexes
7. Explicit client-role privileges

Migrations are forward-only, deterministic, credential-free, and grouped for review. Phase 3B
defines no destructive production rollback procedure.

## Extensions

`pgcrypto` supplies UUID generation and SHA-256 hashing for server-issued anonymous-session secrets.
PostGIS is not enabled.

## Local reset

With Docker running and the Supabase CLI available:

```sh
supabase start
supabase db reset
supabase test db
```

`supabase db reset` recreates the local database, applies migrations in filename order, and loads
`supabase/seed.sql`. It must never target a linked production project.

## Rollback and production risk

Local reset is destructive and local-only. Future hosted releases require backups, rehearsal,
forward-compatible expansion/contraction, measured lock impact, and explicit rollback decisions.
Enum changes, RLS mistakes, trigger behavior, data backfills, and provenance-link migrations require
particular review.

## Type generation

The committed database types are a manually maintained temporary boundary because a clean local
stack was not available during initial authoring. Once local reset succeeds:

```sh
supabase gen types typescript --local > infrastructure/supabase/types.generated.ts
```

Generated output must be reviewed, reproducible, and kept separate from domain models.
