# RLS and Access Control

## Public reads

Public Place policies require real classification, published and verified states, no suppression,
current freshness, a verified assertion, and an approved Source. Events and Food have equivalent
real/published/verified boundaries. Active occurrences must be scheduled or rescheduled and not
expired. Emergency reads add publication eligibility, current freshness, and safe Place state.

Synthetic records are never visible through public content policies. Development inspection uses
trusted local/service operations and must retain TEST DATA labeling.

## Anonymous ownership

Traveler sessions are not Supabase Auth users. A server issues a high-entropy secret and stores only
its SHA-256 hash. RLS resolves the session through a trusted request header and rejects expired,
revoked, or deleted sessions. Client-supplied session UUIDs have no authority.

Policies constrain sessions to their own Trips, itinerary records, saved Places, reports, and AI
usage. There is no public policy for creating session records; a later trusted server endpoint must
create them. Client grants cannot modify secret hashes, expiry, classification, or identifiers.

The unresolved dependency is the application-layer mechanism that places the verified secret into
the PostgREST request context without exposing service-role authority. This must be threat-modeled
and integration-tested before browser access.

## Admin and service role

Admin helpers bind `auth.uid()` to an active Founder or Editor. General content accepts active-admin
work; emergency changes require Founder. Audit reads require Founder. This is deliberately minimal.

Service-role credentials bypass RLS and are reserved for trusted server operations. The service
client factory rejects browser execution and accepts development/test configuration only. No key is
committed or read by client UI code.

## Privileges

Client roles receive explicit table/column grants in addition to RLS. Default future table
privileges are revoked. RLS is not treated as a substitute for least-privilege grants.
