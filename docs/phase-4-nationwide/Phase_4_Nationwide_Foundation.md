# Phase 4 — Thailand Nationwide Content Foundation

## Result

Phase 4 adds a standardized foundation for all 77 provinces without weakening the existing evidence, licensing, verification, emergency-safety, or synthetic-publication controls. The nationwide import is deliberately separate from the default fictional test seed and produces real-classification records only in `draft` and `evidence_pending` states.

## Database

Migration `202608010008_nationwide_content_foundation.sql` adds province profile metadata, official codes, region metadata, slugs, capital district, history, description, geography, climate, area, population, motto, coordinates, SEO fields, tags, media references, verification metadata, confidence, private notes, and a provider-neutral future-map configuration.

Attractions, restaurants, local specialties, and events gain the Phase 4 metadata that was not already represented by translations, contacts, opening hours, media, assertions, and verification tables. Food-to-destination and emergency-to-destination public views use `security_invoker`, so underlying RLS remains authoritative.

`supabase/nationwide-draft-seed.sql` contains exactly 77 standardized province identities. It is repeatable and must be run explicitly after migrations. It does not add attractions, businesses, emergency contacts, events, descriptions, coordinates, population figures, or images. Those require approved sources and CMS review.

## Public API and search

The versioned catalog supports province profiles plus bounded search across eligible Places, restaurants, food specialties, and events. Search accepts keyword, destination, district, and category filters where the entity model supports them. Public responses exclude internal notes, raw assertions, reviewer identities, private evidence, and licensing documents.

Map links are generated centrally through the existing provider-neutral handoff and require valid coordinates. Google Maps and Apple Maps remain external; there is no navigation engine.

## Traveler experience

The traveler shell now uses the five-item Home, Explore, Trips, AI, and Profile navigation. Home is a premium image-first content shell with province, attraction, restaurant, specialty, festival, AI status, recent-trip, and emergency areas. Explore includes nationwide search and province cards.

`/provinces/[id]` reserves a stable layout for a hero, summary, quick actions, content sections, external navigation actions, and an illustrated 3D map marked **Coming Soon**. No 3D map implementation or map SDK is included.

The AI route is an honest status entry point. Phase 4 does not implement AI trip planning, and no provider request is sent.

## CMS

The existing Founder/Editor lifecycle now recognizes geography and destination records and supports bounded atomic draft batches. The Admin workspace includes province/content modules, search, filters, workflow controls, preview-oriented structure, and bulk-draft affordances. Authentication still fails closed until Supabase Auth is configured and verified; therefore the workspace cannot be publicly accessed or represented as authenticated.

## Publication process

For each province, the founder must acquire and approve source rights, attach field-level assertions, add reviewed traveler translations, verify time-sensitive facts, approve image rights, and only then activate the destination. Emergency services continue to require authoritative evidence, verified publishable contact data, safety review, freshness, and Founder authority.

## Explicitly deferred

- Illustrated 3D province maps and landmark pins
- Internal navigation or route computation
- Hotel booking
- AI trip planning
- Unverified nationwide place, business, festival, image, or emergency ingestion
- Public activation of the 77 draft province identities
- Production Admin access until Supabase Auth verification

## Validation completed

- Prettier formatting and Git whitespace checks
- TypeScript and ESLint
- 37 unit/application tests across 13 files
- Next.js production build with 11 generated routes
- Three Playwright critical journeys, including the five-item mobile navigation and province fallback
- Responsive browser inspection at 390 px and 1280 px with no horizontal overflow
- Eight migrations from a clean isolated PostgreSQL 17 database
- Repeat execution of the fictional seed and the 77-province draft seed
- Three SQL suites covering constraints, session RLS, activation gates, public-column permissions, and nationwide isolation
- Production dependency audit with zero reported vulnerabilities
- Repository, client-bundle, private-key, and credential-pattern inspection

Docker and the Supabase Local Stack were unavailable. A later environment must still run `supabase start`, `supabase db reset`, `supabase test db`, and `supabase gen types typescript --local` before production deployment.
