# AI and Infrastructure Budget

## Status

- Currency: Thai baht (THB)
- All amounts and quotas: **Proposed**, requiring founder approval
- Accepted ceilings: pilot THB 8,000/month; early public MVP THB 15,000/month
- Prices are not verified in this register until provider evidence is attached.
- Excluded: founder labor, legal review, photography, field verification, and taxes unless separately approved.

## Development and private testing

| Category | Proposed monthly range |
|---|---:|
| Hosting | THB 0–300 |
| Database | THB 0–300 |
| Storage and CDN | THB 0–200 |
| AI usage | THB 300–1,000 |
| Monitoring and analytics | THB 0–200 |
| Email | THB 0–100 |
| Backups | THB 0–200 |
| Domain/certificates, amortized | THB 50–100 |
| Contingency | THB 200–500 |
| **Proposed total** | **THB 550–2,900** |

Proposed working limit: THB 2,500/month. If the range cannot fit, reduce AI tests rather than silently raise the limit.

## Limited pilot

| Category | Proposed monthly range |
|---|---:|
| Hosting | THB 200–700 |
| Database | THB 900–1,500 |
| Storage and CDN | THB 100–600 |
| AI usage | THB 1,500–3,500 |
| Monitoring and analytics | THB 0–500 |
| Email | THB 0–200 |
| Backups | THB 0–500 |
| Domain/certificates, amortized | THB 50–100 |
| Contingency | THB 500–1,000 |
| **Proposed total** | **THB 3,250–8,600** |

Hard ceiling: **THB 8,000/month**. Use the lower end or remove optional capability; the high estimate is evidence that not every item can run at its maximum simultaneously.

## Early public MVP

| Category | Proposed monthly range |
|---|---:|
| Hosting | THB 300–1,500 |
| Database | THB 900–2,000 |
| Storage and CDN | THB 300–1,200 |
| AI usage | THB 4,000–8,000 |
| Monitoring and analytics | THB 0–800 |
| Email | THB 0–300 |
| Backups | THB 200–700 |
| Domain/certificates, amortized | THB 50–100 |
| Contingency | THB 1,000–2,000 |
| **Proposed total** | **THB 6,750–16,600** |

Normal target: THB 10,000/month. Hard ceiling: **THB 15,000/month**. The catalog and AI limits must be adjusted so the tested projection stays below the ceiling.

## Proposed usage controls

| Control | Proposed value | Approval |
|---|---:|---|
| Per-device/anonymous session | 5 AI requests/day; 50/rolling 30 days | Founder unresolved |
| Concurrent per session | 1 generation | Founder unresolved |
| Pilot global daily/monthly | 200 / 2,000 requests | Founder unresolved |
| Early-public global daily/monthly | 1,000 / 20,000 requests | Founder unresolved |
| User input | 2,000 characters/request | Founder unresolved |
| AI response | About 2,000 output tokens or 1,200 words | Founder unresolved |
| Itinerary | 7 days; up to 8 items/day | Founder unresolved |
| Itinerary revisions | 3/day within request allowance | Founder unresolved |
| Conversation context | Last 6 messages plus bounded structured summary, maximum 8,000 input tokens | Founder unresolved |
| Chargeable retry | At most 1, only for a classified transient failure | Founder unresolved |

Do not use invasive fingerprinting. Coarse network limits must tolerate shared hotel, airport, and café networks.

## Budget controls

- 50% projected ceiling: weekly report
- 70%: daily report; disable experiments
- 80%: shorten responses/context and lower guest allowance
- 90%: disable itinerary regeneration and retain short grounded assistance
- 100% or anomalous spike: disable paid AI and optional metered providers

Automatic model degradation may select a cheaper approved model only if it passed the same relevant safety and grounding threshold. It must not route to an unapproved provider.

## Shutdown and fallback

- Global AI disable switch
- Per-feature and per-provider kill switches
- Provider-side monthly limit where available
- Environment-scoped revocable credentials
- Circuit breaker for cost/error anomalies
- Independent founder alert
- Verified deterministic records, emergency directory, saved essentials, private reporting, and Google/Apple map handoff remain available

## Evidence needed

- Current price and tax evidence for every provider
- Token measurements from representative English/Thai tasks
- Pilot traffic and retry assumptions
- Media and database growth measurement
- Backup and egress cost
- Provider-side hard-limit behavior

## Founder approval

All quotas remain **Proposed**. The two monthly ceilings are accepted working decisions, but operational allocation and shutdown thresholds still require explicit founder approval.
