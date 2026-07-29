# Cost Ceiling and Usage Budget

## Basis and assumptions

- Assessment date: 2026-07-29
- Currency: Thai baht (THB)
- Planning conversion only: USD 1 = THB 36; this is not a forecast or accounting rate.
- Figures are monthly ranges, rounded, exclusive of founder labor, legal review, photography, and taxes unless stated.
- Provider prices, exchange rates, and taxes must be rechecked before purchase.
- Tourists remain free users.

Current official reference points include Supabase Pro beginning at USD 25/month ([pricing](https://supabase.com/pricing)), Cloudflare Workers Paid with a USD 5 minimum ([pricing](https://developers.cloudflare.com/workers/platform/pricing/)), and Sentry’s single-user Developer tier at USD 0 ([pricing](https://sentry.io/pricing/)). AI remains usage-based; the project must select a current model and calculate its token cost immediately before implementation.

## Scenario budgets

### Scenario 1 — Private development and testing

Assumptions: founder only, synthetic or small authorized dataset, fewer than 200 AI requests/month, no commercial weather.

| Category | Fixed THB | Usage THB | Notes |
|---|---:|---:|---|
| Hosting | 0–200 | 0–100 | Free tier preferred |
| Database/auth/storage | 0 | 0 | Development free tier |
| Storage/CDN | 0 | 0–100 | Tiny authorized asset set |
| AI | 0 | 300–1,000 | Hard prepaid/project limit |
| Weather | 0 | 0 | Deferred |
| Translation | 0 | 0–200 | Human testing plus bounded AI |
| Analytics/monitoring/email | 0 | 0–100 | Free tiers |
| Backups | 0–200 | 0 | Local encrypted export plus provider capability |
| Domain/certificates | 50–100 | 0 | Monthly amortization; certificate expected free |
| Contingency | 0 | 200 |
| **Estimated total** | **50–500** | **500–1,700** | **THB 550–2,200** |

Recommended working cap: **THB 2,500/month**.

### Scenario 2 — Limited private pilot

Assumptions: 50–150 invited testers, 2,000 AI requests/month maximum, one bounded destination, authorized media, no live weather unless specifically approved.

| Category | Fixed THB | Usage THB |
|---|---:|---:|
| Hosting | 180–400 | 0–300 |
| Managed database/auth/storage | 900–1,200 | 0–300 |
| Storage/CDN | 0–200 | 100–400 |
| AI | 0 | 1,500–3,500 |
| Weather | 0 | 0–1,500 |
| Translation | 0 | 0–500 |
| Analytics/monitoring/email | 0–300 | 0–300 |
| Backups | 0–300 | 0–200 |
| Domain/certificates | 50–100 | 0 |
| Contingency | 500 | 500 |
| **Estimated total** | **1,630–3,000** | **2,100–7,500** |

Recommended working cap: **THB 8,000/month**. Weather must fit inside the cap rather than increase it.

### Scenario 3 — Early public MVP

Assumptions: 1,000–3,000 monthly visitors, no more than 20,000 AI requests/month, one destination, bounded media, no paid maps API.

| Category | Fixed THB | Usage THB |
|---|---:|---:|
| Hosting | 180–500 | 200–1,000 |
| Managed database/auth/storage | 900–1,500 | 300–1,000 |
| Storage/CDN | 0–300 | 300–1,000 |
| AI | 0 | 4,000–8,000 |
| Weather | 0–1,500 | 0–500 |
| Translation | 0 | 0–800 |
| Analytics | 0–300 | 0–200 |
| Monitoring | 0–300 | 0–300 |
| Email | 0–200 | 0–200 |
| Backups | 200–500 | 0–200 |
| Domain/certificates | 50–100 | 0 |
| Contingency | 1,000 | 1,000 |
| **Estimated total** | **2,330–6,200** | **5,800–14,200** |

Recommended normal target: **THB 10,000/month**.  
Recommended **hard monthly ceiling: THB 15,000** for infrastructure and metered providers combined.

The ceiling excludes one-time legal review, field verification, and photography; those require separate approved project budgets.

## MVP AI limits

Recommended starting controls:

- Guest/session: 5 AI requests per day and 50 per rolling 30 days
- Suspicious/new session: lower temporary limit until normal behavior is established
- Maximum input: 2,000 user characters per request
- Maximum generated response: 1,200 words or approximately 2,000 output tokens, whichever stops first
- Maximum itinerary generation: 7 days and 8 planned items per day
- Maximum itinerary revisions: 3 per day within the AI request allowance
- Server global pilot limit: 200 AI requests/day and 2,000/month
- Server global early-public limit: 1,000/day and 20,000/month
- One concurrent AI generation per guest session
- No automatic retries of chargeable generation without bounded policy

Limits are initial hypotheses. Adjust only from measured task success and actual model pricing.

## Alerts and automatic degradation

- 50% projected monthly ceiling: weekly founder notice
- 70%: daily cost report and disable nonessential AI experiments
- 80%: shorten outputs, reduce context, and lower per-session allowance
- 90%: pause itinerary regeneration and retain one short grounded assistance mode
- 100% or anomalous spike: disable paid AI and other optional metered providers

At every level, verified directory content, emergency records, saved trips, private corrections, and Google/Apple map handoff remain available.

## Emergency shutdown controls

- Provider-level kill switch
- Global AI kill switch
- Per-feature quota
- Maximum provider-side monthly spend where available
- Revocable keys scoped by environment
- Circuit breaker for error or cost spikes
- No uncontrolled fallback to another paid provider
- Founder notification through an independent channel

Cloudflare documents CPU limits to reduce denial-of-wallet risk for Workers ([official pricing and limits](https://developers.cloudflare.com/workers/platform/pricing/)). Similar hard limits should be preferred for every provider.

## Cost risks

- Model price or exchange-rate changes
- Long prompts and repeated itinerary regeneration
- Bot traffic that rotates identifiers
- Image/CDN egress
- Database plan upgrades and backup requirements
- Commercial weather licensing
- Legal, translation review, photography, and local verification omitted from monthly operations

## Founder approvals

- THB 15,000 early-public hard ceiling
- THB 8,000 pilot cap
- Initial AI quotas and itinerary limits
- Whether weather is funded
- Separate one-time feasibility budget
