# Database Testing

## Automated static and adapter tests

Vitest verifies migration ordering, required safety functions, RLS presence, the Event/Food identity
distinction, reserved seed domains, non-callable emergency fixtures, absence of embedded secrets,
domain mapping, provider-neutral failures, and injected Trip classification.

## Local database tests

`supabase/tests/001_persistence_safety.sql` runs transactionally after migration and seed loading. It
tests synthetic publication rejection, Event/Food separation, emergency suppression, non-callable
contacts, session-secret resolution, media expiry, and cancelled occurrences.

Run:

```sh
supabase start
supabase db reset
supabase test db
```

Additional manual RLS verification should execute PostgREST requests as `anon` with two distinct
server-issued secrets and confirm cross-session Trip, saved-Place, itinerary, and report access is
denied.

## Limitations

The full chain was applied from a clean database on an isolated PostgreSQL 17 cluster with minimal
Supabase role and `auth.uid()` stubs. The seed loaded twice, constraint tests passed, and RLS tests
executed as the `anon` role with two session secrets. This validates PostgreSQL syntax and policy
behavior but not PostgREST request-header propagation, Supabase Auth integration, or hosted
Supabase configuration.

Docker was unavailable, so `supabase db reset`, `supabase test db`, and automatic local type
generation remain unverified. No test connects to a hosted project or the public internet.
