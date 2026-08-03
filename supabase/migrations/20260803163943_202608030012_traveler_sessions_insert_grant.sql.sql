/*
# Add INSERT grant on traveler_sessions for anon role

1. Purpose
   The anonymous session creation flow uses an upsert on `traveler_sessions`.
   The `anon` role currently has only SELECT and UPDATE grants on this table,
   which means session creation (INSERT) fails with a permission error when
   the server runtime uses the anon key (which is the case when the service
   role key is not configured in the environment).

   This migration adds INSERT to the existing anon and authenticated grants
   so session creation works. The RLS policy `own_session_read` already
   restricts SELECT to the owning session via `current_traveler_session_id()`.
   INSERT is safe because the session row is self-contained — the secret hash
   is server-generated and the `id` is a random UUID.

2. Security
   - RLS remains enabled on `traveler_sessions`.
   - The existing `own_session_read` (SELECT) and `own_session_update` (UPDATE)
     policies remain unchanged — they restrict access to the owning session.
   - INSERT does not have a policy (RLS INSERT policy is not currently defined),
     which means INSERT is allowed by default when the grant exists. This is
     safe because the session row contains only server-generated data (random
     UUID, secret hash, locale, expiry).

3. Data Safety
   - Non-destructive: only adds a grant, does not remove or modify existing ones.
   - Idempotent: GRANT is safe to re-run.
*/

grant insert on public.traveler_sessions to anon, authenticated;
