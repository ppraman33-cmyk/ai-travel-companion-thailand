# Phase 2 Design Report

## 1. Documents created

Twelve design documents cover domain, logical data, contracts, flows, wireframes, design system, AI, administration, synthetic data, testing, backlog, and this report.

## 2. Major architecture decisions

- Responsive PWA and modular monolith
- Supabase PostgreSQL direction with normalized business facts
- Common Place identity plus subtype profiles
- Anonymous server session; optional accounts deferred
- OpenAI behind provider-neutral adapter
- Deterministic catalog available without AI
- Google/Apple URL handoff only
- Evidence-gated publication and hard synthetic isolation
- First-class emergency directory with field-level suppression
- No weather in first slice, internal navigation, hotel booking, public reviews, or sponsored ranking

## 3. Logical data-model summary

Nationwide geography is independent from activated coverage. Place is the single physical identity. Restaurant, attraction, market, and emergency profiles extend Place. Events and occurrences are separate. Sources, assertions, licenses, verification, and media rights form the publication gate. Sessions own Trips, itinerary items, and saves. AI request/response/citation/usage records enforce grounding and cost. Admin users and audit events govern changes.

## 4. API summary

Logical contracts cover sessions, discovery/search, details, food, events, emergency, Trips, AI proposals/revisions, saves, reports, map handoff, and protected admin operations. Contracts return provenance/freshness and synthetic markers, use cursor pagination, suppress stale emergency fields, and expose product-level provider-neutral errors.

## 5. Core user journeys

The design specifies 18 flows from first visit through guest Trip and AI itinerary, external map handoff, private corrections, quota/outage fallback, no-result behavior, and stale-emergency suppression. Core browsing and safety functions do not require an account or AI.

## 6. UI screen inventory

Traveler: Home, Explore, Search, Place, Restaurant, Event, Emergency Assistance, Trip, AI Chat, Saved, Report, Settings/Privacy. Admin: dashboard, record editor, verification queue, image-rights review. All include responsive, accessibility, loading, empty, error, provenance, freshness, and synthetic states.

## 7. AI interaction summary

AI consumes only structured allowed records and citations, never unrestricted web facts or model-memory evidence. It proposes rather than confirms Trip changes. Entity allow-list, citation, freshness, risk, and size validation precede delivery. Emergency, medical, legal, immigration, and safety requests use constrained fallback. Cost thresholds degrade and then disable AI while preserving deterministic features.

## 8. Admin workflow summary

Founder/editor workflows cover record identity, sources/assertions, media rights, translation, verification, publication, volatile updates, emergency suppression, reports, license expiry, takedown, and audit. One priority queue keeps operation realistic for a solo founder.

## 9. Test-data strategy

Development uses visibly synthetic geography, entities, contacts, domains, licenses, media, sessions, Trips, and AI conversations. Synthetic records cannot enter production publication state and cannot be converted into real records. No real emergency number or plausible public misinformation is used.

## 10. Testing strategy

P0 gates cover domain/database constraints, contracts, critical end-to-end journeys, accessibility, AI grounding/hallucination, emergency safety, provenance/rights expiry, quotas/budgets, provider failure, security, retention, audit, and synthetic isolation. Critical fabrication tolerance is zero.

## 11. Implementation sequence

Foundation → domain types → schema/migrations → synthetic fixtures → admin lifecycle → public catalog/PWA → food/events → deterministic emergency → anonymous Trips → AI itinerary → map handoff/reporting → cost/security → pilot readiness.

This sequence is future implementation planning; no implementation artifacts were created in Phase 2.

## 12. Tasks that can be bundled

- A: repository conventions, domain types, test harness
- B: persistence and synthetic fixtures
- C: content administration, evidence, media, audit
- D: public catalog, PWA, food, events
- E: emergency, sessions/Trips, map handoff, corrections
- F: AI itinerary, evaluation, quotas, cost
- G: security, performance, accessibility, pilot exercises

## 13. Tasks that must remain sequential

Domain before schema; schema before fixtures; fixtures before feature testing; admin lifecycle before public reads; catalog/Trip/emergency before AI; usage tracking before AI exposure; thin slice before hardening; Phase 1B evidence before any real publication.

## 14. Unresolved founder decisions

- Exact Chiang Mai boundary and service radius
- English/Thai safety reviewer
- Provider terms/regions/retention and final stack approval
- Quotas, retention periods, and budget allocation
- Image acquisition/licenses and legal review
- Emergency cadence and reviewer
- Smoke-season trigger policy
- Physical geometry/search/provenance-link choices
- Runtime/framework, admin authentication, AI delivery mode

## 15. Evidence-related publication blockers

No real source inventory, emergency register, image rights set, exact boundary, provider/legal approval, measured content capacity, or smoke-season authority is complete. These block real-content publication and pilot, but do not block internal design or synthetic implementation.

## 16. Recommendation

**Ready for implementation planning with conditions.**

Conditions:

- Founder approves the Phase 2 logical specifications and resolves decisions needed by Batch A.
- Implementation remains synthetic-only until Phase 1B gates close.
- Each batch includes its P0 safety, provenance, cost, accessibility, and synthetic-isolation tests.
- No production configuration or public real content is introduced by inference.

Do not proceed directly to public pilot. The next authorized activity should be a founder-reviewed implementation plan for Batch A, or further evidence closure.
