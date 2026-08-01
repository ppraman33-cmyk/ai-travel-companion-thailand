# Supabase boundary

This folder contains the Phase 3B Supabase-compatible persistence boundary. Database row types remain
separate from domain models. The persistence client is injected into repository adapters, and
database errors are translated into provider-neutral application errors.

Public and service-role factories are separate. The service-role factory rejects browser execution;
production configuration is accepted only through an explicit server-side composition boundary. No
client is initialized at module load time and no credentials are committed.

The manual boundary remains isolated from the generated schema snapshot. After a clean local reset,
update the snapshot with:

`npm run db:types:generate`

CI runs `npm run db:types:check` and must reject a missing or different
`infrastructure/supabase/types.generated.ts`. Supabase CLI type generation requires a working Docker
or Podman runtime because it launches `postgres-meta`, including when a direct database URL is used.
