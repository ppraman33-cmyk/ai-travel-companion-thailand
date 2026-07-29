# Implementation Backlog

## Conventions

Complexity: XS, S, M, L, XL. Priority: P0 foundation/critical, P1 MVP, P2 deferred. Estimates are relative and require refinement. This backlog authorizes no implementation.

## Sequenced backlog

| # / Epic | Feature and tasks | Dependencies | Acceptance criteria | Risk | Priority / complexity |
|---|---|---|---|---|---|
| 1 Repository/configuration | Workspace layout; environment separation; formatting/lint/test commands; secret and deployment placeholders without production values | Approved tech decisions | Reproducible local checks; no secret committed; synthetic banner default | Premature provider lock-in | P0 / M |
| 2 Shared domain types | Status vocabularies; Place/subtype identity; evidence, synthetic, Trip, AI contracts | Phase 2 approval | One source of domain semantics; invalid states representable only explicitly | Types diverge from persistence | P0 / M |
| 3 Database schema/migrations | Translate logical tables; constraints/indexes; authorization policies; retention hooks | 2; geometry/provenance decisions | Disposable DB passes constraint tests; no SQL generated until this future task | Polymorphic integrity/search complexity | P0 / XL |
| 4 Synthetic seed data | Fixture definitions and isolation checks for required categories | 3 | Minimum dataset loads only in nonproduction; no real emergency facts | Test data mistaken for real | P0 / L |
| 5 Minimal admin workflows | Draft/edit, duplicate check, sources/assertions, verification, publish/suppress, media rights, audit | 3–4 | Founder completes synthetic record lifecycle; publication gate works | Admin scope expands | P0 / XL |
| 6 Public discovery contracts | Session-independent discovery/search/detail; provenance/freshness; pagination | 3–5 | Only publishable nonsynthetic records in production mode; contract tests pass | Query/search performance | P0 / L |
| 7 Responsive PWA shell | Navigation, states, synthetic banner, accessibility foundation, local cache boundary | 1, contracts from 2/6 | Mobile/desktop shell and offline-safe static behavior pass | UI before stable contracts | P1 / L |
| 8 Place/restaurant discovery | Explore/search/detail/save UI and contracts; food specialty links; image attribution | 6–7 | Thai/English search, one Place identity, no sponsored ranking | Unverified claims/image rights | P1 / L |
| 9 Events/markets | Event/occurrence model, recurrence/status, detail/list/admin maintenance | 5–8 | Cancel/reschedule/expire behavior and provenance pass | Recurrence complexity | P1 / L |
| 10 Emergency directory | Safety subtype, field suppression, category search, call/map actions, admin cadence | 5–7; safety policy | P0 emergency tests pass; no AI-generated facts | Physical harm from stale data | P0 / XL |
| 11 Anonymous sessions/trips | Secure guest ownership; trip/day/item CRUD; expiry/local essentials | 3,7 | Cross-session access denied; manual Trip works without AI | Session loss/retention | P0 / L |
| 12 AI itinerary thin slice | Provider adapter; retrieval allow-list; generate/validate/cite proposal; revision diff; fallback | 6,9–11; AI eval set | Zero critical fabrication; quotas/cost recorded; no direct confirmation | Cost and hallucination | P0 / XL |
| 13 External map handoff | Google/Apple URL adapter and copyable address fallback | 6,8,10 | Verified synthetic destination only; no internal navigation | Provider format changes | P1 / S |
| 14 Incorrect-information reporting | Private form, queue, triage, suppression/correction linkage | 5–8,10 | Report is private and never auto-verifies; audit works | Abuse/sensitive data | P1 / M |
| 15 Cost controls | Session/global limits, token/size caps, usage ledger, alerts, kill switches, degradation | 11–12 | Threshold simulations pass; deterministic features remain | Denial of wallet | P0 / L |
| 16 Security hardening | Threat cases, headers/session controls, admin auth, log scrubbing, dependency/secret checks, backups | All core epics | P0 security/restore/takedown tests pass | Late security redesign | P0 / L |
| 17 Testing/pilot readiness | Contract/E2E/a11y/AI/load/cost exercises; runbook; evidence gates | 1–16; Phase 1B for real pilot | All P0 pass; cost <70%; real content still blocked until evidence | False readiness from synthetic success | P0 / XL |

## Feature-level task slices

Each epic should split into: domain rule, persistence design, application contract, admin/public experience, tests, observability/cost, and documentation update. No slice is complete without its safety/error states.

## Consolidated Codex implementation batches

| Batch | Epics/tasks that can be bundled | Why |
|---|---|---|
| A Foundation | 1–2 plus test harness skeleton | Shared conventions and no business persistence dependency |
| B Data core | 3–4 plus constraint/synthetic-isolation tests | Schema and fixtures must evolve together |
| C Content operations | 5 plus evidence/media/audit tests | One end-to-end publication lifecycle |
| D Public catalog | 6–9 plus relevant PWA screens | Shared read contracts/cards/search, after content lifecycle |
| E Safety and traveler state | 10–11, 13–14 | Uses stable public catalog; can share session/security patterns |
| F AI and cost | 12 and 15 plus AI evaluation | AI cannot be safe before catalog/Trip/usage structures |
| G Hardening | 16–17 | Cross-cutting validation after thin slice exists |

Bundles are proposed working units, not parallel authorization. Keep each batch reviewable and deploy no real content.

## Sequential dependencies that must remain

1. Domain semantics before physical schema: prevents inconsistent identities/statuses.
2. Schema before fixtures/admin/public contracts: constraints define valid state.
3. Synthetic fixtures before feature work: enables safe tests without real records.
4. Admin publication lifecycle before public catalog: public data must be governable.
5. Public catalog and event semantics before AI: AI needs approved structured retrieval.
6. Manual Trip before AI Trip: fallback and ownership must work independently.
7. Emergency deterministic directory before any emergency AI explanation.
8. Usage ledger before public AI exposure: budget protection is mandatory.
9. Full thin slice before load/security/pilot gate.
10. Phase 1B evidence closure before real-content pilot/publication, regardless of code readiness.

## Work explicitly deferred

Optional accounts, native apps, complex offline sync, collaboration, public reviews, notifications, live weather/air quality, affiliate/booking, sponsorship, partner portal, multiple AI providers, dedicated search/warehouse, and microservices.

## Unresolved planning decisions

Physical schema link strategy, framework/runtime choice, admin authentication, geometry/search implementation, AI response delivery mode, exact quotas/retention, testing tools, and batch size. Resolve them before the affected epic, not all upfront.
