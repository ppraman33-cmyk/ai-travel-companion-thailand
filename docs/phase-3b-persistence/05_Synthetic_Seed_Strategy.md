# Synthetic Seed Strategy

## Dataset

The seed includes fictional geography and destinations, restaurant, attraction, Food specialty,
cancelled Event occurrence, stale suppressed emergency profile, Sources, assertions, verification,
expired media rights, two anonymous sessions, a Trip and itinerary item, saved Place, correction
report, and AI quota record.

One unmistakably fictional `real`-classification Place exercises production-safe RLS behavior. It
does not represent a real location and is never suitable for deployment.

## Naming and contact rules

English labels begin with `TEST DATA` or explicitly say fictional. Thai labels state that they are
test or fictional records. URLs use `example.test`. Coordinates are obvious test values. Emergency
contacts use `NOT-CALLABLE-TEST`; real Thai emergency numbers are prohibited.

## Isolation

Synthetic records may be draft or approved but cannot be published. The stale emergency is fully
suppressed, the Event occurrence is cancelled, the media license is expired, and one translation
path remains unpublished. Seeds load only through local/test reset.

## Repeatability

Stable UUIDs and `ON CONFLICT DO NOTHING` make seed loading repeatable. The authoritative clean-state
process remains `supabase db reset`; manually deleting individual fixture rows can violate foreign
keys and is not the reset strategy.
