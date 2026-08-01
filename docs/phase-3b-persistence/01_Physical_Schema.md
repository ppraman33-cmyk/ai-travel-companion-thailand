# Physical Schema

## Scope

Phase 3B implements a PostgreSQL schema compatible with a local Supabase stack. It is a modular
monolith persistence layer for synthetic development and future evidence-gated content. It does not
activate a public destination or connect to a hosted project.

## Table inventory

| Area                    | Tables                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Geography               | `geographies`, `destinations`                                                                                                                                 |
| Place identity          | `places`, `place_translations`, `external_references`                                                                                                         |
| Subtypes and food       | `restaurant_profiles`, `attraction_profiles`, `food_specialties`, `food_specialty_translations`, `food_specialty_destinations`, `restaurant_food_specialties` |
| Events and hours        | `events`, `event_translations`, `event_occurrences`, `opening_hour_sets`, `opening_hour_rules`                                                                |
| Provenance              | `sources`, `source_assertions`, `place_assertions`, `food_specialty_assertions`, `event_assertions`                                                           |
| Rights and verification | `licenses`, `verifications`, `place_verifications`, `food_specialty_verifications`, `event_verifications`                                                     |
| Contacts and media      | `contact_methods`, `media_assets`, `place_media`                                                                                                              |
| Emergency               | `emergency_service_profiles`, `emergency_incidents`                                                                                                           |
| Traveler                | `traveler_sessions`, `trips`, `itinerary_days`, `itinerary_items`, `saved_places`                                                                             |
| Operations              | `ai_usage_records`, `incorrect_information_reports`, `admin_users`, `audit_events`                                                                            |

## Key relationships

`Place` is the physical identity. Restaurant, attraction, and emergency profiles use its UUID.
Food specialties and Events have independent UUIDs. An Event occurrence may reference a venue
Place. Itinerary items reference exactly one Place or Event occurrence. Trips and saved Places
belong to anonymous traveler sessions.

Assertions use a constrained subject vocabulary plus typed link tables for Place, Food, and Event.
The generic UUID is retained for assertion snapshots across lower-risk subjects, but publication
gates rely on typed links rather than an unconstrained polymorphic value alone.

## Status design

Low-change shared states use PostgreSQL enums: data classification, publication status, and
verification status. Operational workflows likely to evolve—destination activation, occurrence,
translation, report, rights, and suppression states—use constrained text. Synthetic publishable
roots cannot transition to `published`.

## Indexes

Indexes support destination/publication queries, Place category and normalized name, bounded
latitude/longitude filtering, event dates, emergency category and freshness, assertion rechecks,
media expiry, session expiry, Trip ownership and ordering, report queues, audit lookup, and AI usage
by session/time.

## PostGIS decision

PostGIS is deferred. MVP adapter queries use a bounded coordinate window, and navigation remains an
external Google Maps or Apple Maps handoff. There is no route calculation. Add PostGIS only after
measured nearby-query requirements justify the operational dependency.

## Normalization and phases

Queryable facts, ownership, rights, contacts, occurrences, and hours are normalized. JSONB is
limited to consent choices, boundary metadata, recurrence-source metadata, claimed-value snapshots,
and bounded audit summaries. Optional accounts, collaboration, reviews, notifications, affiliate
data, sponsorship, booking, and automated ingestion remain post-MVP or future-state.
