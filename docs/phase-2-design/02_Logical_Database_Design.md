# Logical Database Design

## Scope

This is a relational design specification, not SQL or a migration. PostgreSQL is the working direction. Names are logical and may change during migration design.

Common conventions: opaque IDs; created/updated timestamps; `synthetic` flag on publishable roots; explicit publication and verification states; no generic soft delete for evidence/audit; traveler deletion follows retention policy.

## Geography and place identity

| Table | Purpose; key concept | Important fields and relationships | Constraints and indexes | Lifecycle/provenance/scope |
|---|---|---|---|---|
| `geographies` | Nationwide hierarchy; geography ID | parent geography, type, Thai/English display names, timezone, activation state, synthetic | unique(parent,type,normalized Thai name); parent/type and active indexes | Archive, not delete referenced geography. MVP |
| `geography_aliases` | Search names/transliterations; alias ID | geography, language, alias, normalized alias, review state | unique(geography,language,normalized alias); search index | Reviewed aliases. MVP |
| `coverage_areas` | Operational boundary independent of hierarchy; area ID | name, geometry reference, purpose, activation state, evidence ref | active/purpose index; geometry implementation deferred | Exact real boundary evidence-gated. MVP |
| `places` | One physical identity; Place ID | geography, canonical address/location, category flags, publication/verification, synthetic | duplicate-candidate indexes on normalized name/location; published/category/location indexes | Suppress/archive; source-backed. MVP |
| `place_names` | Multilingual names; name ID | Place, language, value, type (canonical/display/alias), review | one canonical per Place/language; normalized search index | Never auto-translate critical name. MVP |
| `place_descriptions` | Reviewed multilingual prose; description ID | Place, language, summary/body, reviewer, publication | unique(Place,language,version); published index | Version/archive; provenance link. MVP |
| `place_addresses` | Structured/display address; address ID | Place, language, components, display, source assertion | Place/language index | Volatile evidence where needed. MVP |
| `place_locations` | Coordinate observation; location ID | Place, coordinates, accuracy, source assertion, active | one preferred active location; spatial index suggested | Never derive from unauthorized maps. MVP |
| `restaurant_profiles` | Restaurant subtype; Place ID as key | service/cuisine/dietary/price attributes, subtype status | indexes on cuisine, dietary, published | One per Place. MVP |
| `restaurant_food_specialties` | Restaurant–specialty link; composite concept | Restaurant Place, specialty, evidence | unique pair | Remove/archive unsupported link. MVP |
| `food_specialties` | Culinary concept; specialty ID | geography relevance, Thai/English content refs, status, synthetic | normalized Thai name/geography unique candidate; published index | Source/review required. MVP |
| `attraction_profiles` | Attraction subtype; Place ID | types, duration, accessibility, hidden-gem editorial flag | type/published indexes | One per Place. MVP |
| `market_profiles` | Market/walking-street subtype; profile ID | Place, market type, recurrence policy, status | unique active type per Place; published index | May relate to Event. MVP |
| `local_activities` | Activity concept; activity ID | Place/geography, organizer, type, duration, status, synthetic | type/geography/published indexes | No checkout. MVP |

## Volatile facts, events, and emergency

| Table | Purpose; key | Fields/relationships | Constraints/indexes | Lifecycle/provenance/scope |
|---|---|---|---|---|
| `opening_hour_sets` | Effective schedule; set ID | Place, timezone, effective/expiry, verification | Place/current index | Archive versions; assertion-backed. MVP |
| `opening_hour_rules` | Weekly/exception rule; rule ID | set, day/date, open/close, closed flag | set/day index; validate intervals | No inferred 24-hour claim. MVP |
| `contact_methods` | Phone/web/email; contact ID | subject type/ID, type, value, purpose, active, assertion | subject/type and active indexes | Critical contacts suppress independently. MVP |
| `events` | Event concept; Event ID | name/content refs, organizer/source, host Place, recurrence, publication, synthetic | published/type/host indexes | Archive enduring concept. MVP |
| `event_occurrences` | Dated instance; occurrence ID | Event, start/end/timezone, venue override, status, assertion | unique event/start candidate; date/status indexes | Cancel/reschedule/expire, not overwrite. MVP |
| `emergency_service_profiles` | Safety subtype; Place ID | category, authority, jurisdiction, critical freshness class, state | category/location/publishable indexes | Stale critical data suppresses. MVP |
| `emergency_capabilities` | Explicit verified capability; ID | service Place, capability, assertion, status | unique active service/capability | No inference. MVP |

## Provenance, rights, and media

| Table | Purpose; key | Fields/relationships | Constraints/indexes | Lifecycle/provenance/scope |
|---|---|---|---|---|
| `sources` | Evidence origin; source ID | owner, type, reference, rights/approval status | owner/type/status indexes | Expire/reject, preserve audit. MVP |
| `source_assertions` | Field-level evidence; assertion ID | source, subject type/ID, field key, value snapshot, observed/effective/expiry, confidence, state | subject/field/current; source/expiry indexes | Append/revise; never silently overwrite. MVP |
| `licenses` | Rights terms; license ID | holder, type, terms ref, uses, attribution, modification/cache, expiry, state | state/expiry indexes | Expiry triggers suppression review. MVP |
| `source_licenses` | Source–license relationship | source, license, effective period | unique active pair | Evidence-gated. MVP |
| `verifications` | Review result; verification ID | target, method, reviewer Admin, checked/next check, status, evidence | target/current and next-check queue indexes | Historical rows retained. MVP |
| `external_provider_refs` | Provider mapping; ref ID | provider, entity type/ID, internal target, restrictions | unique(provider,type,provider ID); target index | Retire without changing identity. MVP |
| `media_assets` | Governed asset; asset ID | origin, creator/holder, license, storage key, real-subject flag, synthetic, status | status/expiry/origin indexes | Takedown/expire, do not hard delete audit. MVP |
| `media_links` | Asset display relation | asset, subject, context, sort order, status | unique asset/subject/context; subject index | AI decorative prohibited on real galleries via rule. MVP |
| `media_transformations` | Authorized derivative manifest | asset, operation, derived storage key | unique derived key | Only permitted transformations. MVP |

## Traveler, trips, AI, and operations

| Table | Purpose; key | Fields/relationships | Constraints/indexes | Lifecycle/provenance/scope |
|---|---|---|---|---|
| `traveler_sessions` | Anonymous session; session ID | token hash, locale, consent, last active, expiry, synthetic | unique token hash; expiry index | Hard/pseudonymous deletion per retention. MVP |
| `trips` | Session trip; trip ID | session, dates, timezone, title, interests/constraints, status | session/status; date validation | Delete/anonymize per retention. MVP |
| `itinerary_days` | Trip day; day ID | trip, local date, order | unique(trip,date), unique(trip,order) | Cascade with trip. MVP |
| `itinerary_items` | Planned item; item ID | day, order, item type, Place/Event occurrence/Activity ref, state, origin | one valid target by item type; day/order index | AI items start proposed. MVP |
| `saved_places` | Bookmark; saved ID | session, Place, optional Trip, saved date | unique(session,Place,Trip context) | Hard delete on user action. MVP |
| `ai_requests` | Intent/quota record; request ID | session, Trip, class, status, prompt retention ref, correlation, synthetic | session/time and status indexes | Minimize raw prompt; retain usage metadata. MVP |
| `ai_responses` | Validated output; response ID | request, provider/model version, status, content/structured result ref, limitations | request unique delivered candidate; status index | Rejected candidate not user-visible. MVP |
| `ai_citations` | Response-to-evidence link | response, subject, assertion/source, claim key | response and target indexes | Citation must resolve to allowed context. MVP |
| `provider_usage` | Cost/limit accounting; usage ID | request, provider, units, estimated cost THB, occurred date | provider/date/session indexes | Aggregate retention; no sensitive content. MVP |
| `usage_buckets` | Fast quota counters; bucket ID | scope hash, feature, period, count/cost | unique(scope,feature,period) | Expire after limit/audit period. MVP |
| `incorrect_information_reports` | Private correction; report ID | target, category, detail, evidence, session/contact optional, state | state/severity/received indexes | Retain per approved policy. MVP |
| `admin_users` | Founder/editor profile; admin ID | auth subject, role, status | unique auth subject; role/status | Disable, do not reuse identity. MVP |
| `audit_events` | Privileged history; event ID | actor, action, target, time, correlation, reason, bounded diff | target/time and actor/time indexes | Append-oriented; retention controlled. MVP |

## Publication and synthetic isolation

- Public queries require `published`, valid verification/freshness, valid rights, and `synthetic = false`.
- Development environments may expose synthetic data only with an explicit response marker.
- Production publication transitions reject synthetic roots and any linked synthetic evidence/media.
- Emergency public queries additionally require current critical assertions.

## Post-MVP tables

Optional accounts, account-trip links, collaborators, public reviews, notification subscriptions, affiliate referrals, sponsorships, and booking links are deferred.

## Future migration risks and normalization trade-offs

- Polymorphic subject links simplify provenance across domains but weaken native foreign-key enforcement; migration design may choose typed link tables for critical subjects.
- JSON can hold provider payload snapshots and low-value metadata, but queryable business facts stay normalized.
- Geometry support may use PostgreSQL extensions; portability and hosting support require a decision.
- Opening hours and recurrence are complex; normalized rules improve validation but increase editor complexity.
- Multiple subtype profiles preserve one identity but need strong application rules to prevent incompatible states.
- Full-text/alias search may begin in PostgreSQL; dedicated search is future-only after measured need.
- Append-only assertions/verifications increase storage but preserve audit and conflict history.
- Estimated provider cost in THB needs original billing currency and conversion metadata to avoid false precision.
- Retention deletion across backups and provider logs cannot be solved by relational design alone.

## Unresolved design decisions

Typed versus polymorphic provenance links; geometry implementation; recurrence representation; search extension; exact retention; production synthetic-data enforcement; and whether media storage remains with Supabase.
