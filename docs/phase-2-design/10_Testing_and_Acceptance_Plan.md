# Testing and Acceptance Plan

## Strategy

Test the modular monolith at the cheapest useful layer and reserve end-to-end tests for critical journeys. Synthetic fixtures are the default. Real publication acceptance remains blocked by Phase 1B evidence.

Priority: P0 blocks internal release/pilot; P1 required for MVP readiness; P2 useful before public scale.

## Test matrix

| Category | Objective and examples | Pass criteria | Priority | Automation |
|---|---|---|---|---|
| Unit | Domain transitions, alias normalization, date/time, freshness, map handoff input, quota calculation | Boundary cases deterministic; invalid transitions rejected | P0 | Full for pure rules |
| Integration | Module/data/provider adapters; create draft→verify→publish synthetic; AI outage | Correct transaction/failure behavior; no provider leakage | P0 | Automated with fakes/sandbox |
| API contract | Request/response/error/pagination/synthetic marker | Formal contract compatibility; auth and metadata present | P0 | Automated consumer/provider tests |
| Database constraints | One Place identity candidates, unique trip day/order, subtype rules, synthetic publish block | Every invalid fixture fails and valid fixture persists | P0 | Automated against disposable database |
| UI component | Buttons, inputs, status badges, cards, dialogs, loading/empty/error | Keyboard/screen-reader semantics and state variants pass | P1 | Component tests plus visual review |
| End-to-end | Guest→Trip→AI proposal→save→map; emergency lookup; correction/admin suppression | Critical journey succeeds; deterministic fallback works | P0 | Small stable browser suite |
| Accessibility | Keyboard, focus, labels, contrast, reflow, reduced motion, English/Thai | WCAG 2.2 AA target; no critical automated/manual finding | P0/P1 | Automated scan plus manual assistive tech |
| AI grounding | Recommendations/itinerary use only supplied IDs and assertions | 100% entity resolution; ≥95% material citation validity | P0 | Versioned evaluation harness |
| AI hallucination | Ask for unknown venue/hours/contact/event; conflicting sources | Zero fabricated critical facts; unsupported claims refused | P0 | Automated assertions plus human sample |
| Emergency safety | Stale/disputed phone, missing coordinate, capability inference, no result | 100% critical suppression; call/map disabled; safe fallback | P0 | Automated plus manual review |
| Provenance | Publish with missing source/assertion/recheck; field source drawer | Gate blocks incomplete content; exact claim evidence resolves | P0 | Automated workflow/contract |
| License expiry | Expire source/media license; cache/search/public views | New publication blocked; delivery removed; audit preserved | P0 | Time-controlled integration/E2E |
| Rate limit | Session/device/global/concurrency/retry limits; shared-network tolerance | Correct limit/error/retry; emergency reads unaffected | P0 | Automated load and policy tests |
| Budget limit | Simulate 70/80/90/100% thresholds and provider cost spike | Alerts/degradation/kill switch fire; no unapproved failover | P0 | Fake metering plus limited sandbox |
| Provider outage | AI, database, media, analytics, email, map provider failures | Defined fallback; sensitive internals hidden; no data corruption | P0/P1 | Fault injection at adapters |
| Security | Session fixation/ownership, CSRF decision, injection/XSS, admin authorization, secret/log leakage, prompt injection | No cross-session/admin bypass; sanitized output/logs; tools constrained | P0 | Static/dynamic checks plus threat cases |
| Synthetic isolation | Production read/write, linked synthetic media/assertion, screenshots/exports | Production publication impossible; markers everywhere nonproduction | P0 | CI policy and E2E |
| Localization | Thai canonical names, aliases, date/time, wrapping, mixed script | No data corruption; reviewed critical labels; correct timezone | P1 | Automated fixtures plus fluent review |
| Performance | Search/detail/Trip and bounded AI latency under pilot load | Founder-approved budgets; no unbounded query/context | P1 | Load/profile after thin slice |
| Retention/deletion | Expire session/trip/chat/log/report; backup restore behavior | Primary/projections delete per approved policy; exceptions recorded | P0 before pilot | Time-controlled integration/manual provider check |
| Audit | Privileged creation, publish, suppress, rights, takedown, sensitive read | Required immutable event with actor/reason/correlation | P0 | Automated workflow |

## Critical end-to-end journeys

1. First visit without account; manual area discovery.
2. Create anonymous session and Trip.
3. Generate a grounded synthetic itinerary and accept selected proposals.
4. Find synthetic food/place and save it.
5. Generate Google/Apple external handoff from verified synthetic destination.
6. Find synthetic emergency service; suppress stale contact and verify action removal.
7. Report incorrect information; founder triages and corrects.
8. Expire image rights; public asset disappears without AI replacement.
9. Exhaust AI quota; manual deterministic features remain.
10. Shut down AI provider; emergency and saved Trip remain usable.

## AI evaluation set

Version prompts, structured context, expected allowed IDs, required/refused claims, risk class, language, and pass rationale. Critical failures have zero tolerance. Model/prompt/provider changes rerun the full P0 set.

## Manual acceptance

- Founder reviews admin workload and publication gate clarity.
- Fluent reviewer checks safety-critical English/Thai content before real pilot.
- Assistive-technology pass includes keyboard, VoiceOver/TalkBack or equivalent, zoom, and high-contrast conditions.
- Device tests cover representative compact and wide browsers plus PWA install/offline-cache limits.

## MVP exit criteria

- All P0 automated tests pass.
- No open critical security, rights, emergency, synthetic-isolation, or AI-fabrication defect.
- P1 failures have accepted owner/deadline and cannot affect safe publication.
- Seven-day load/cost test projects below 70% of applicable ceiling.
- Restore, takedown, emergency suppression, provider kill switch, and rollback exercises pass.
- Phase 1B evidence gates separately approve any real content.

## Post-MVP testing

Accounts, collaboration, public reviews, notifications, live weather, commercial features, and multiple providers require new threat, privacy, contract, and acceptance plans.
