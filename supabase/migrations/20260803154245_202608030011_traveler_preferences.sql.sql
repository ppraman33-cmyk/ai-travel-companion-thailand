/*
# Add traveler preferences to traveler_sessions

1. Purpose
   Extend the existing anonymous-session model to store traveler preferences
   collected during first-run onboarding. Preferences are stored as a JSONB
   column on `traveler_sessions` (no new table needed) so they inherit the
   existing RLS ownership model — a session can only read/write its own row.

2. New Columns
   - `traveler_sessions.traveler_preferences` (jsonb, default '{}')
     Stores onboarding preferences: transportation, travelStyle, companions,
     activityLevel, budget, and language. All fields are optional (skippable).
     The column is NOT NULL with a default of '{}' so existing rows and new
     sessions without onboarding remain valid.

3. Security
   - No new tables — the column is on `traveler_sessions` which already has
     RLS enabled and policies that restrict access to the owning session.
   - No new policies needed — existing `traveler_sessions` policies already
     scope by `traveler_session_id` ownership.
   - No privilege changes needed.

4. Data Safety
   - Uses `ADD COLUMN IF NOT EXISTS` — idempotent and non-destructive.
   - Existing rows get the default '{}' — no data is lost or transformed.
*/

alter table public.traveler_sessions
  add column if not exists traveler_preferences jsonb not null default '{}'::jsonb;

comment on column public.traveler_sessions.traveler_preferences is
  'Onboarding preferences collected from the traveler: transportation, travelStyle, companions, activityLevel, budget, language. All optional.';
