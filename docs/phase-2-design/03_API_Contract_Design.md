# API Contract Design

## Contract conventions

Logical contracts only; no controllers or implementation. Base version is conceptually `/v1`. JSON field naming and exact schemas remain design decisions.

Common response metadata: `request_id`, `synthetic_data`, `generated_at`, locale, and pagination cursor where relevant. Public content includes `publication_status`, `verification_status`, `last_checked_at`, `freshness`, `sources[]`, `attribution[]`, and `limitations[]`.

Provider failures use product errors, never provider-native errors. Standard codes include `INVALID_REQUEST`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `STALE_SUPPRESSED`, `RATE_LIMITED`, `AI_QUOTA_EXCEEDED`, `AI_UNAVAILABLE`, `PROVIDER_UNAVAILABLE`, and `INTERNAL_ERROR`.

## Endpoint groups

MVP groups are Session, Discovery, Search, Place Detail, Restaurant and Food, Events and Markets, Emergency Directory, Trips, AI Itinerary Assistance, Saved Places, Incorrect-Information Reporting, Admin Content Management, Admin Verification, Admin Media Rights, and Admin Publication Control.

## Traveler contract catalog

| Method/path | Purpose/authentication | Request fields | Response/pagination | Errors, limits, provenance | Scope |
|---|---|---|---|---|---|
| `POST /sessions` | Create anonymous session; none | locale, consent choices, client synthetic mode in nonproduction | session expiry and capabilities; no pagination | rate limit by coarse network; never fingerprint | MVP |
| `GET /sessions/current` | Read session; session cookie | none | locale, quotas, expiry | unauthenticated/expired | MVP |
| `DELETE /sessions/current` | Delete guest state; session | confirmation | deletion receipt | conflict during active operation | MVP |
| `GET /discover` | Curated categories; optional session | area ID, interests, category, cursor, limit | cards, reasons, cursor | published/fresh only; max 30/page | MVP |
| `GET /search` | Thai/English alias search; optional session | query, area, filters, cursor, limit | disambiguated results, cursor | bounded query; no unrestricted provider lookup | MVP |
| `GET /places/{place_id}` | Common detail; optional session | locale | common Place, subtype summaries, map handoffs, media | 404 or suppressed; provenance included | MVP |
| `GET /restaurants` | Food discovery; optional session | area, cuisine/dietary/specialty, cursor | restaurant summaries and cursor | claims source-backed; max 30 | MVP |
| `GET /food-specialties/{id}` | Specialty detail; optional session | locale | concept, sources, linked restaurants | missing/unpublished | MVP |
| `GET /events` | Current occurrences; optional session | area, date range, type, cursor | occurrences with status/freshness | cancelled/expired excluded by default; max 30 | MVP |
| `GET /events/{id}` | Event/market detail | occurrence ID optional | event, occurrences, venue, sources, handoff | stale occurrence limitation | MVP |
| `GET /emergency-services` | Verified directory; optional session | temporary coordinates or area, category, cursor | current services, call/map actions, verification dates | stale critical fields suppressed; max 20; no commercial order | MVP |
| `GET /emergency-services/{place_id}` | Safety detail | none | verified fields and limitations | `STALE_SUPPRESSED` if no safe public fields | MVP |
| `POST /trips` | Create trip; session | title, dates, timezone, interests/constraints | Trip with empty days | date/size limits | MVP |
| `GET /trips/{id}` | Read owned trip; session | none | trip, days/items | forbidden/not found | MVP |
| `PATCH /trips/{id}` | Edit bounded fields; session | changed fields, revision | updated Trip | conflict on stale revision | MVP |
| `DELETE /trips/{id}` | Delete trip; session | confirmation/revision | deletion receipt | conflict | MVP |
| `POST /trips/{id}/ai-itinerary` | Generate proposal; session | intent, allowed dates, preferences, revision target | accepted/result, citations, quota remaining | quota 5/day proposed; `AI_UNAVAILABLE` returns deterministic alternatives | MVP |
| `POST /trips/{id}/ai-revisions` | Revise proposal; session | instruction, selected items, revision | proposed changes and citations | max 3/day proposed; no silent overwrite | MVP |
| `POST /saved-places` | Save Place; session | place ID, optional trip | saved record | duplicate idempotent | MVP |
| `GET /saved-places` | List saves; session | optional trip, cursor | saved published/suppressed annotations | max 50/page | MVP |
| `DELETE /saved-places/{id}` | Remove save; session | none | deletion receipt | not found | MVP |
| `POST /reports/incorrect-information` | Private report; session optional | target, category, details, optional evidence/contact consent | report reference | size/abuse limit; never public | MVP |
| `POST /map-handoffs` | Generate external URL; optional session | place ID, provider (`google`/`apple`) | verified label/address/coordinates and URL | unavailable if no safe destination fields | MVP |

## AI quota and fallback contract

`AI_QUOTA_EXCEEDED` returns retry window, quota category, and deterministic capabilities; it never offers payment. `AI_UNAVAILABLE` returns a safe message plus links to discovery, saved trip, and emergency directory. Partial provider output is not returned unless fully validated.

## Admin contract catalog

All admin contracts require strong authenticated founder/editor authorization and audit correlation.

| Method/path | Purpose | Request/response | Errors and validation | Scope |
|---|---|---|---|---|
| `GET/POST /admin/content` | List/create draft common records | typed target, synthetic/real classification, fields; draft result | duplicate candidate, missing Thai canonical name | MVP |
| `GET/PATCH /admin/content/{type}/{id}` | Edit record | revision and changed fields; updated draft | optimistic conflict, invalid transition | MVP |
| `POST /admin/sources` | Register evidence source | owner, reference, terms state; Source | no implicit approval | MVP |
| `POST /admin/assertions` | Attach field evidence | source, subject, field/value snapshot, dates; assertion | invalid subject/value or rights state | MVP |
| `POST /admin/verifications` | Record review | target, method, evidence, dates, decision | human required for critical classes | MVP |
| `GET /admin/verification-queue` | Prioritized review list | filters/cursor; queue items | bounded 50/page | MVP |
| `POST /admin/media` | Register asset metadata | origin, rights, subject, storage ref; draft asset | upload/storage separate; rights required | MVP |
| `POST /admin/media/{id}/rights-review` | Approve/reject rights | evidence, restrictions, decision | cannot approve ambiguous/expired rights | MVP |
| `POST /admin/publication/{type}/{id}` | Publish/suppress/archive/takedown | transition, reason, revision | synthetic-to-production rejected; gate failures listed | MVP |
| `POST /admin/emergency/{id}/suppress` | Immediate safety suppression | fields/scope, reason | audit mandatory | MVP |
| `GET /admin/audit` | Review privileged history | target/actor/date filters, cursor | founder-only sensitive views | MVP |
| `POST /admin/reports/{id}/resolution` | Resolve correction | action, evidence, outcome | cannot treat report as proof | MVP |

## Pagination and rate limits

Cursor pagination is stable by deterministic sort plus ID. Public default/max is 20/50; admin default/max 25/100. Proposed AI limits follow Phase 1B and remain founder-unresolved. Non-AI reads use coarse abuse protection; emergency access must not be blocked by ordinary AI quota.

## Synthetic-data contract

Every response includes `synthetic_data`. Nonproduction may return synthetic records with persistent “TEST DATA” labeling. Production public queries reject synthetic rows and linked synthetic assertions/media. Requesting synthetic mode in production returns `FORBIDDEN`.

## Post-MVP contracts

Optional accounts, trip collaboration, public reviews, notifications, affiliate links, sponsored placements, booking handoff tracking, live weather, and partner APIs are deferred. There are no internal navigation or hotel-booking contracts.

## Unresolved decisions

Exact payload schemas, cookie/CSRF approach, asynchronous AI polling versus bounded streaming, idempotency headers, coordinate precision, and formal contract format.
