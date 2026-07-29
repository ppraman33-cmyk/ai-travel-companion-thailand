# Provider Terms and Retention Register

## Use and status

This register records evidence tasks and partial official-page observations. It does not approve a provider or claim that terms are legally sufficient. Recheck prices and terms immediately before procurement and obtain qualified privacy/legal review where required.

Status vocabulary: **Proposed**, **Evidence needed**, **Partially verified**, **Verified**, **Rejected**, **Expired**.

## Evidence requirements per provider

- Item name, category, owner
- Intended use and data sent
- Data retained, purpose, duration, and deletion controls
- Processing/storage regions and subprocessors
- Cross-border considerations
- Free tier and estimated usage model
- Pricing evidence and check date
- Contractual, caching, content, and usage restrictions
- Migration difficulty and export capability
- Outage and fallback behavior
- Reviewer, approval, expiry/recheck, and notes

## Provider register

| Provider/category | Intended use | Evidence obtained | Claimed only from evidence | Missing/restrictions | Checked/reviewer | Status | Recheck |
|---|---|---|---|---|---|---|---|
| OpenAI / AI | Grounded itinerary and travel responses | Official endpoint data-control page: https://platform.openai.com/docs/models/default-usage-policies-by-endpoint | Endpoint behavior and retention controls vary by configuration | Exact model, price, region, contract, subprocessors, deletion, Thai evaluation | 2026-07-29 / Codex | **Partially verified** | Before selection |
| Cloudflare / hosting, CDN, analytics | PWA delivery, bounded server execution, basic analytics | Official Workers pricing page: https://developers.cloudflare.com/workers/platform/pricing/ | Free/paid usage models and CPU limiting are documented | Account terms, region, logs, analytics retention, DPA, actual architecture cost | 2026-07-29 / Codex | **Partially verified** | Before selection |
| Supabase / database, optional auth, storage | Managed PostgreSQL and authorized media | Official pricing: https://supabase.com/pricing | Service bundles and plan categories are documented | Region, backups, DPA, auth/session behavior, storage egress, deletion, exit test | 2026-07-29 / Codex | **Partially verified** | Before selection |
| Cloudflare Web Analytics / analytics | Minimal traffic metrics | Product page: https://www.cloudflare.com/web-analytics/ | Product exists for web analytics | Exact retained fields, cookie behavior, region, free-tier terms, privacy configuration | 2026-07-29 / Codex | **Evidence needed** | Before use |
| Sentry / error monitoring | Errors and performance without sensitive payloads | Official pricing: https://sentry.io/pricing/ | Single-user plan and bounded quotas are documented | Data region, default payloads, retention, scrubbing proof, DPA, subprocessors | 2026-07-29 / Codex | **Partially verified** | Before use |
| Resend / email | Low-volume operational email | Official pricing: https://resend.com/pricing | Pricing page exists | Exact free tier, content/log retention, region, domain verification, DPA, exit | 2026-07-29 / Codex | **Evidence needed** | Before use |
| Supabase Storage / object storage | Authorized documentary/decorative assets | Supabase pricing reference above | Storage is offered | Per-plan limits, CDN/cache, region, deletion, egress, signed access, migration export | 2026-07-29 / Codex | **Evidence needed** | Before use |
| Translation provider / future | Optional dynamic translation | No provider approved | None | Necessity, quality, price, retention, rights in output, Thai review | — / — | **Proposed** | Post-pilot decision |
| Weather provider / future | Weather/air-quality only if separately approved | Open-Meteo pricing: https://open-meteo.com/en/pricing | Free access is described as noncommercial; commercial plans are offered | Feature approval, exact plan, Thai suitability, sources, attribution, caching, region | 2026-07-29 / Codex | **Partially verified** | Before any integration |
| Google Maps URL handoff | Open destination externally | Official URL documentation: https://developers.google.com/maps/documentation/urls/ | URL handoff is documented | Final terms, parameter behavior, branding, device tests, privacy notice | 2026-07-29 / Codex | **Partially verified** | Before use |
| Apple Maps URL handoff | Open destination externally | Official unified URL documentation: https://developer.apple.com/documentation/mapkit/unified-map-urls | URL handoff is documented | Final terms, OS/browser compatibility, device tests, privacy notice | 2026-07-29 / Codex | **Partially verified** | Before use |

## Detailed assessment template

| Field | Value |
|---|---|
| Item name/category/owner | `[Required]` |
| Intended use | `[Bounded MVP purpose]` |
| Data sent | `[Fields and classifications]` |
| Data retained | `[Provider statement plus configuration]` |
| Processing/storage region | `[Evidence required]` |
| Cross-border considerations | `[Qualified review]` |
| Free tier | `[Current evidence, not assumption]` |
| Fixed and usage costs | `[Currency, date, tax, exchange assumption]` |
| Estimated usage | `[Scenario]` |
| Contractual restrictions | `[Terms, content, cache, attribution, prohibited use]` |
| Migration/export | `[Format, process, tested or assumed]` |
| Outage behavior | `[Observed/documented]` |
| Fallback | `[Deterministic or approved alternative]` |
| Evidence obtained/location | `[URLs and stored review]` |
| Restrictions/claims | `[Exact]` |
| Checked/reviewer/status/recheck | `[Required]` |
| Founder/privacy/legal approval | `[Required]` |

## Fallback rules

- AI outage: verified directory, saved essentials, emergency search, and map handoff remain available.
- Hosting outage: restore from documented deployment and backup process; no second live cloud required.
- Database outage: read-only local cache where safe; do not accept changes that cannot be durably recorded.
- Analytics/monitoring/email outage: core product continues.
- Storage outage: show neutral placeholders.
- Map provider failure: offer the other provider or copyable verified address.
- No uncontrolled failover to another paid provider.

## Approval state

Provider direction is accepted, but no provider has full evidence or final approval. Procurement and production use remain **blocked** pending the missing term, retention, region, cost, and processing reviews.
