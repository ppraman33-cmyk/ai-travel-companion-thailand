# Phase 1 Decision Report

## Status

This report consolidates the pre-coding feasibility recommendation. It does not authorize implementation. All provider, price, source, rights, privacy, and legal conclusions require confirmation at the point of procurement or publication.

## 1. Recommended launch destination

**Bounded central Chiang Mai:** founder-approved polygon covering the Old City, Night Bazaar/riverside, and Nimman–Santitham corridors.

Why: it offers the best balance of foreign-tourist relevance, food, cultural attractions, hidden gems, events, walking streets, activities, emergency coverage, and manageable field verification. The wider province is not included automatically.

## 2. Fallback destination

**Ayutthaya historic island plus a defined urban emergency-service radius.**

Why: lower content churn and easier verification make it the operationally safest fallback if Chiang Mai source rights, emergency coverage, or local review cannot pass activation.

## 3. Recommended initial languages

English traveler experience with Thai canonical names, addresses, administrative content, and reviewed bilingual consequential fields. Fixed emergency and safety text must be fluent-reviewed in both English and Thai.

Do not add a third language until pilot demand and reviewer capacity justify it.

## 4. Recommended identity approach

Anonymous server session with a local cache of essential trip data. No required account. Optional accounts are post-MVP and only justified by cross-device access or recovery.

## 5. Recommended MVP provider stack

- AI: OpenAI API through a provider-neutral interface; select a cost-efficient model after evaluation
- Hosting: Cloudflare Pages/Workers
- Database: Supabase managed PostgreSQL
- Authentication: anonymous application session; Supabase Auth reserved for later optional accounts
- Media: Supabase Storage initially, with portable asset metadata
- Weather: defer; if approved, use an appropriately licensed Open-Meteo commercial plan
- Translation: human-reviewed fixed English/Thai plus bounded AI conversation; no separate translation API initially
- Analytics: Cloudflare Web Analytics plus minimal first-party counters
- Error monitoring: Sentry Developer tier with aggressive data scrubbing
- Email: Resend for low-volume transactional messages
- Maps: Google Maps and Apple Maps URL handoff only

No multi-provider runtime, paid Places/routing API, dedicated search cluster, warehouse, Kubernetes, or microservices.

## 6. Recommended authorized-data strategy

- Use specifically licensed government/local open data where the individual dataset permits the intended use.
- Enrich and verify through direct business/venue permission and first-party fieldwork.
- Write original editorial descriptions.
- Maintain record and assertion-level provenance.
- Manually or lightly import the bounded catalog.
- Do not scrape or copy Google Maps, Facebook, general search results, booking sites, or unauthorized directories.
- Treat OSM and public geocoding as license-sensitive, not “free data.”

## 7. Recommended image strategy

Launch safely with neutral category presentation where images are unavailable. Prioritize first-party photography and business-authorized submissions under a reviewed agreement. Use manually verified open-license images sparingly. AI imagery is decorative only and never substitutes for documentary images of real entities.

## 8. Recommended emergency-data policy

- Use authoritative public-service sources plus direct verification.
- Human-review every critical record before publication.
- Recheck national hotlines monthly, hospital/rescue critical fields every 30 days, and other facility records every 60 days.
- Suppress expired or disputed critical assertions.
- Permit call and map actions only from verified structured fields.
- Never allow AI to invent or complete emergency details.
- Exercise the critical-error incident procedure before launch.

## 9. Recommended retention policy

- Guest session identifier: 30 days inactive
- Saved guest trip: 90 days inactive
- Precise location: transient, not stored by default
- Search history: no user history; minimal aggregate counters
- AI conversation: 7 days
- AI summary: 30 days or saved-trip lifetime, whichever is shorter
- Raw analytics: 30 days; non-identifying aggregates 13 months
- Error logs: 14 days
- Incorrect-information reports: 180 days after resolution
- Administrative audit: 24 months
- Backups: rolling 30 days

These periods require founder and qualified legal approval.

## 10. Recommended monthly budget ceiling

- Private development: THB 2,500/month
- Limited pilot: THB 8,000/month
- Early public normal target: THB 10,000/month
- **Early public hard ceiling: THB 15,000/month**

One-time legal review, photography, and field verification are separate budgets.

Initial user limits: 5 AI requests/day and 50 per 30 days per guest session; 2,000-character input; roughly 2,000 output tokens/1,200 words; maximum seven-day itinerary with eight items per day. Early-public global cap: 1,000 AI requests/day and 20,000/month, subject to actual model cost.

## 11. Decisions requiring founder approval

- Exact Chiang Mai polygon and emergency-service radius
- Confirmation of local verification capacity
- English/Thai scope and fluent-review resource
- Whether smoke season changes launch timing or product policy
- Provider stack and third-party retention acceptability
- Whether weather is excluded from the first pilot
- THB 15,000 hard ceiling and initial quotas
- Retention schedule
- Photography and legal-review budgets
- Accepted open licenses and business image agreement
- Destination activation thresholds

## 12. Risks that could still block implementation

- Candidate government or local datasets do not grant required reuse rights.
- Emergency facility records cannot be sourced and maintained reliably.
- Documentary image rights cannot be proven.
- No qualified Thai safety/content reviewer is available.
- Chiang Mai smoke season makes intended launch timing unsafe or unhelpful.
- AI fails zero-fabrication critical tests or exceeds the budget.
- Provider processing/retention or cross-border terms are unacceptable.
- Solo-founder review queue exceeds sustainable capacity.
- Qualified legal advice materially changes the data, image, privacy, or retention plan.

## 13. Phase 1 exit checklist

- [ ] Founder approves launch destination and exact boundary.
- [ ] Founder approves English/Thai scope and reviewer.
- [ ] A source inventory proves authorization for minimum catalog thresholds.
- [ ] Emergency-data sample passes the verification policy.
- [ ] Image-rights sample and agreement pass qualified review.
- [ ] Provider terms, retention, locations, and prices are revalidated.
- [ ] Anonymous session and retention strategies are approved.
- [ ] THB cost ceiling and automatic shutdown policy are approved.
- [ ] Destination activation standards are accepted.
- [ ] Legal/privacy review questions have owners and budget.
- [ ] No unresolved blocker would materially change the architecture.

Phase 1 is **document-complete but not decision-complete** until these approvals and evidence checks pass.

## 14. Exact recommended next phase

After founder approval, begin **Phase 1B — Evidence Acquisition and Decision Closure**, still without application code:

1. Draw the exact Chiang Mai launch polygon.
2. Build a source-by-source rights inventory for the minimum activation catalog.
3. Verify a representative emergency dataset directly with authorities/facilities.
4. Obtain or draft-reviewed image permissions and business submission agreement.
5. Run English/Thai AI and search feasibility tests using approved sample records.
6. Reprice the chosen provider stack and document data-processing terms.
7. Obtain qualified legal/privacy review on the identified questions.
8. Update every checklist item with evidence and a founder decision.

Only after Phase 1B passes should the project enter detailed product and technical design. Do not begin implementation directly from this report.
