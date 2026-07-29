# Founder Decision Register

## Use

This register separates Codex recommendations from founder decisions. A recommendation does not authorize procurement, publication, or implementation.

Status vocabulary: **Proposed**, **Evidence needed**, **Partially verified**, **Verified**, **Rejected**, **Expired**. For decisions, `Verified` means the decision and its evidence are recorded; it does not certify legal compliance.

## Decision register

| Decision | Recommendation | Alternatives | Impact | Evidence required | Risk if delayed | Founder decision/date | Revisit date | Status |
|---|---|---|---|---|---|---|---|---|
| Exact Chiang Mai boundary | Connected central polygon covering proposed Old City, Night Bazaar/riverside, and Nimman–Santitham zones | Smaller single-zone pilot; Ayutthaya fallback | Determines catalog, safety radius, verification cost | Licensed boundary, field tests, emergency map, capacity | No defensible coverage claim | `[Unresolved / date]` | `[Date]` | **Evidence needed** |
| Initial languages | English interface with Thai canonical data and reviewed bilingual consequential fields | English plus Thai names only; add third language later | Safety QA and search workload | Fluent reviewer and sample evaluation | Unsafe or inconsistent content | `[Unresolved]` | `[Date]` | **Evidence needed** |
| Anonymous session | Anonymous server session with local cached essentials | Local-only; optional account; required account | Privacy, abuse, persistence | Threat/privacy design and recovery tradeoff acceptance | Architecture ambiguity | `[Unresolved]` | `[Date]` | **Proposed** |
| Optional accounts | Defer until cross-device/recovery evidence | Include optional account in MVP | Data and support burden | User research and legal/provider review | Scope growth if undecided | `[Unresolved]` | Post-pilot | **Proposed** |
| Provider stack | OpenAI, Cloudflare, Supabase, minimal analytics/monitoring/email | Other single-provider options | Cost, retention, lock-in | Complete provider register and term review | Procurement or redesign delay | `[Unresolved]` | Before procurement | **Partially verified** |
| AI quotas | 5/day and 50/30 days per guest; bounded global limits | Lower/higher quotas | Cost and usefulness | Token tests and pilot demand | Runaway cost or poor utility | `[Unresolved]` | After pilot week 1 | **Proposed** |
| Monthly budgets | Pilot THB 8,000; early public THB 15,000 hard ceiling | Lower ceilings or smaller scope | Financial sustainability | Current provider prices and load test | Cannot set safe usage | Working direction accepted; operational allocation unresolved | Monthly | **Partially verified** |
| Retention periods | Minimum periods in retention register | Shorter session-only or longer saved-trip periods | Privacy and product continuity | Qualified review and provider deletion evidence | Notices/design remain blocked | `[Unresolved]` | 90 days after pilot | **Evidence needed** |
| Image strategy | First-party/business-authorized first; neutral placeholders; AI decorative only | Commissioned/open-license mix | Rights risk and content quality | Agreement, asset evidence, legal review | Copyright/takedown blocker | `[Unresolved]` | Before first asset | **Evidence needed** |
| Emergency cadence | Monthly hotlines; 30-day critical hospital/rescue; 60-day other facilities | Stricter or source-driven cadence | Safety and workload | Authority sample, reviewer, timed workflow | Unsafe stale data | `[Unresolved]` | After four-week trial | **Evidence needed** |
| Smoke-season policy | No live data first slice; sourced seasonal notice; documented pause rule | Delay launch; licensed live integration | Safety, launch timing, cost | Authority/provider and health review | Unsafe communication or launch disruption | `[Unresolved]` | Before pilot dates | **Evidence needed** |
| Destination activation thresholds | Retain Phase 1 thresholds; enforce evidence blockers | Smaller catalog with disclosed limitations | Launch usefulness and workload | Sample catalog and four-week capacity | Endless preparation or weak launch | `[Unresolved]` | Pilot review | **Proposed** |
| Legal-review timing | Before source approval, image agreement, provider procurement, privacy notice, and emergency disclaimer | One combined pre-launch review | Avoids rework and unsupported claims | Reviewer scope, quote, deliverables | Material redesign late | `[Unresolved]` | Before affected decision | **Evidence needed** |
| Pilot start criteria | All Phase 1B evidence blockers closed; load and incident exercises pass | Internal founder-only test first | Controls release risk | Exit checklist evidence | Unsafe or unlawful pilot | `[Unresolved]` | Pilot gate | **Evidence needed** |

## Decision record template

| Field | Value |
|---|---|
| Item name/category/owner | `[Required]` |
| Recommendation and alternatives | `[Required]` |
| Evidence obtained | `[References]` |
| Evidence still needed | `[Required]` |
| Rights/verification claimed | `[Exact, bounded]` |
| Restrictions and impact | `[Required]` |
| Founder decision | `[Approve / reject / revise / defer]` |
| Decision rationale | `[Required]` |
| Decision date and founder | `[YYYY-MM-DD / name]` |
| Reviewer | `[Name]` |
| Status | `[Controlled status]` |
| Expiry/revisit | `[YYYY-MM-DD]` |
| Notes | `[Risks and conditions]` |

## Approval state

Working directions supplied at the start of Phase 1B remain accepted as directions. No unresolved row is converted to a final decision merely because this register exists.
