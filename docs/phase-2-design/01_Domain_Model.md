# Domain Model

## Scope and conventions

This logical model supports nationwide geography while operational publication remains limited to an evidence-approved area. MVP development uses synthetic records marked `synthetic`; real records cannot reach `published` until rights, provenance, verification, and freshness gates pass.

All identifiers are opaque internal IDs. Provider IDs never define identity. Timestamps use an absolute instant plus an explicit Thailand/local timezone where display semantics matter.

Common lifecycle states:

- Content: `draft`, `in_review`, `published`, `stale`, `suppressed`, `expired`, `archived`, `takedown`
- Verification: `unverified`, `pending`, `verified`, `disputed`, `expired`, `rejected`
- Synthetic: `synthetic` or `real`; synthetic content is permanently non-production

## Identity and subtype rule

`Place` is the single identity for a physical venue, point, or bounded area. Restaurant, attraction, market/walking-street, local-activity venue, and emergency-service objects are optional one-to-one or one-to-many subtype profiles referencing that place. A venue that is both an attraction and market keeps one Place ID with two subtype profiles. Events reference a host/venue Place but are not places. Food specialties are concepts and may link to many restaurants.

Before creating a Place, administration searches canonical Thai name, aliases, coordinates, address, and provider references. Suspected duplicates block publication pending resolution.

## Content and operations objects

| Object | Purpose and owner | Required fields | Optional fields and relationships | Lifecycle/status | Rules and scope |
|---|---|---|---|---|---|
| Geography | Nationwide hierarchy and launch coverage; admin-owned | ID, type, Thai name, parent, country code, status, synthetic flag | English name, geometry reference, timezone, aliases | draft→active→archived | Country/province/district/subdistrict/locality; launch activation separate. MVP |
| Place | Common real/synthetic physical identity; admin-owned | ID, geography, canonical Thai name, category set, address summary, location, publication and verification states, synthetic flag | English names, aliases, description, accessibility, provider refs, media | content lifecycle | No subtype creates a second identity. MVP |
| Restaurant | Food-service subtype of Place | Place ID, service type, cuisine tags, verification | dietary features, price band, specialties | follows Place plus subtype state | Claims require evidence; no ranking payment. MVP |
| Food specialty | Regional culinary concept | ID, Thai name, category, geography relevance, publication state | English name/summary, ingredients, dietary cautions, restaurants | content lifecycle | Not a venue; culturally reviewed. MVP |
| Attraction | Visitor-interest subtype of Place | Place ID, attraction types, verification | visit notes, accessibility, typical duration | follows Place | Hidden-gem label is editorial, not a separate identity. MVP |
| Event | Enduring event concept | ID, Thai name, organizer/source, type, publication state, synthetic flag | English name/summary, venue Place, recurrence, media | draft→published→archived | Does not imply a current occurrence. MVP |
| Event occurrence | Dated event instance | ID, Event ID, start/end, timezone, occurrence status, verification | venue override, fee assertion, notes | scheduled/rescheduled/cancelled/completed/expired/suppressed | Current display requires fresh evidence. MVP |
| Market/walking street | Recurring local-experience subtype | ID, Place ID, type, recurrence/operating pattern, verification | associated Event, vendor/cultural notes | content lifecycle | One Place; occurrences represented separately where dated. MVP |
| Local activity | Book-free activity/experience concept | ID, type, geography or Place, publication state | schedule, suitability, duration, organizer | content lifecycle | No internal checkout/booking. MVP |
| Emergency service | Safety-critical Place subtype | Place ID, service category, authority, critical verification state, stale threshold | capabilities only with evidence, jurisdiction | verified/published→stale/suppressed | No sponsorship; critical fields suppress independently. MVP |
| Media asset | Governed image/media identity | ID, origin class, creator/rights holder, license, storage ref, synthetic flag, status | subject Place/Event/Food, attribution, transformations, AI metadata | draft→approved→published→expired/takedown | AI decorative media cannot be documentary or real-place gallery media. MVP |
| Source | Evidence origin | ID, owner/authority, source type, reference, access/rights status | provider details, terms ref, quality notes | proposed/approved/rejected/expired | Approval requires evidence, not accessibility. MVP |
| Source assertion | Evidence for one fact | ID, source, subject type/ID, field/claim key, claimed value snapshot, observed date, status | effective/expiry dates, confidence, notes | pending→verified/disputed/expired | Required for volatile/safety-critical facts. MVP |
| License | Rights governing data/media | ID, rights holder, type/terms reference, permitted use, status | attribution, modification, caching, territory, expiry | proposed/approved/expired/takedown | Publication blocked when required rights fail. MVP |
| Verification | Review decision | ID, target type/ID, method, reviewer, checked/next-check dates, status | evidence refs, confidence, notes | pending→verified/disputed/expired | Human required for critical emergency and rights approvals. MVP |
| External provider reference | Replaceable external mapping | ID, provider, provider entity type/ID, internal subject | source, retrieved date, restrictions | active/retired | Unique per provider/type/provider ID. MVP |
| Incorrect-information report | Private correction signal | ID, target, category, details, received date, status | reporter contact if voluntarily supplied, evidence, resolution | open/triaged/investigating/resolved/rejected | Never published as a review. MVP |
| Admin user | Founder/editor identity | ID, role, auth subject, status | scoped permissions, display name | invited/active/suspended/disabled | Founder/editor only initially; strong auth. MVP |
| Audit event | Append-oriented privileged history | ID, actor, action, target, timestamp, correlation ID | before/after summary, reason, evidence ref | immutable/retention-expired | Avoid unnecessary sensitive payloads. MVP |

## Traveler and AI objects

| Object | Purpose and owner | Required fields | Optional fields/relationships | Lifecycle/status | Rules and scope |
|---|---|---|---|---|---|
| Traveler session | Anonymous continuity and quotas; traveler-controlled | ID, created/last-active, locale, synthetic flag, expiry | consent choices, coarse selected area | active/expired/deleted/blocked | No fingerprint identity; proposed 30-day inactivity. MVP |
| Trip | User trip container | ID, session, title, start/end dates, timezone, status | interests, constraints, selected geographies | draft/active/completed/deleted | Max seven days per AI generation, not necessarily trip lifetime. MVP |
| Itinerary day | Ordered day within Trip | ID, Trip ID, local date, order | notes | active/deleted | Unique date per trip. MVP |
| Itinerary item | Planned item | ID, day, order, item type, state | Place/Event occurrence/activity refs, user note, proposed time | proposed/confirmed/skipped/deleted | AI creates proposed items; traveler confirms. MVP |
| Saved place | Session bookmark | ID, session, Place ID, saved date | Trip ID, note | active/deleted | Unique session/place/trip context. MVP |
| AI request | Metered intent record | ID, session, request class, received time, status, synthetic flag | Trip, normalized prompt, allowed entity IDs | accepted/rate_limited/processing/completed/failed/refused | Raw prompt retention minimized. MVP |
| AI response | Grounded result and usage | ID, request, provider/model version, response class, status | bounded text, structured itinerary proposal, citation refs, limitations, token/cost metrics | candidate/validated/delivered/rejected | Cannot reference non-allowed real entities; validation before delivery. MVP |

## Post-MVP and future-state boundaries

- Post-MVP: optional accounts, cross-device sync, collaborative trips, public reviews, affiliate attribution, external booking links, sponsored placements, live weather/air quality, richer offline packs.
- Future-state: native clients, partner portals, automated ingestion, multiple active AI providers, dedicated search/analytics services.
- Explicitly excluded from planned MVP: internal navigation engine and internal hotel booking.

## Unresolved dependencies

- Exact launch polygon and evidence-approved real sources
- Final retention and provider terms
- Physical database choices for geometry/search implementation
- Founder-approved quotas and emergency cadence
- Thai safety reviewer and publication authorization
