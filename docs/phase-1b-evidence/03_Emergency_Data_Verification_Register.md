# Emergency Data Verification Register

## Safety rule

This register contains no verified real emergency records. Do not populate from model memory or general search. Each real entry requires authoritative evidence, a secondary check where required, and human review.

## Status vocabulary

**Proposed**, **Evidence needed**, **Partially verified**, **Verified**, **Rejected**, **Expired**.

## Required record template

| Field | Value |
|---|---|
| Item name | `[Internal record label]` |
| Official Thai name | `[Authoritative evidence required]` |
| English display name | `[Reviewed translation]` |
| Service category | `[Hospital / clinic / pharmacy / police / tourist police / rescue / fire / hotline / assistance]` |
| Owner or authority | `[Required]` |
| Official phone | `[Do not infer]` |
| Address | `[Authoritative or directly verified]` |
| Coordinates | `[Authorized source and field check]` |
| Operating status | `[Verified current state]` |
| Service hours | `[Only when relevant and verified]` |
| Authoritative source | `[URL/document]` |
| Secondary verification | `[URL/document/contact record]` |
| Evidence obtained | `[Exact evidence summary]` |
| Verification claimed | `[Fields supported by evidence]` |
| Restrictions | `[Jurisdiction, language, capability, access limitations]` |
| Date verified | `[YYYY-MM-DD]` |
| Reviewer | `[Named human]` |
| Status | **Evidence needed** |
| Next verification | `[YYYY-MM-DD]` |
| Stale threshold | `[Approved category rule]` |
| Suppression status | `[Published / partially suppressed / fully suppressed]` |
| Expiry or recheck date | `[YYYY-MM-DD]` |
| Incident notes | `[Reports, conflicts, corrections]` |

## Category registers

Create one completed template per candidate record under each section:

### Hospitals

Minimum evidence: responsible health authority or official register plus direct official facility confirmation for critical contact, location, operating state, and any emergency-capability claim.

### Clinics

Minimum evidence: official regulator/public-health source plus direct facility confirmation. Do not infer specialty, emergency capability, or 24-hour operation.

### Pharmacies

Minimum evidence: authorized registry or responsible authority plus direct confirmation for public hours and contact details.

### Police stations

Minimum evidence: Royal Thai Police or official station/government source; verify station category and jurisdiction.

### Tourist Police

Minimum evidence: Tourist Police Bureau source; claims about languages or operating hours require explicit evidence.

### Rescue services

Minimum evidence: NIEM, local authority, or formally recognized service authority. Distinguish public EMS dispatch from private or volunteer organizations.

### Fire stations

Minimum evidence: responsible local authority or fire department. A national hotline does not independently verify a station record.

### National emergency telephone numbers

Minimum evidence: responsible national authority and a current corroborating official publication where possible. Recheck immediately before release.

### Local assistance services

Minimum evidence: responsible service owner, government authority, embassy/consulate, TAT, or Tourist Police as applicable.

## Proposed reverification cadence

All intervals require founder and safety-review approval:

- National emergency numbers: monthly
- Hospital and rescue critical fields: every 30 days; stale at 45 days
- Clinics, pharmacies, police, tourist police locations, and fire stations: every 60 days; stale at 75 days
- Other assistance: every 60–90 days according to consequence
- Any credible correction: immediate suppression review regardless of age

## Suppression behavior

- Suppress a disputed or expired critical phone, coordinate, address, capability, or classification.
- Keep independently verified fields only if they remain safe and useful.
- Disable call and map actions when their source field is suppressed.
- Never allow stale cached emergency data to outlive the approved threshold.
- Preserve minimum audit evidence subject to retention policy.

## AI and user-action rules

- AI retrieves only currently publishable structured records.
- AI must not generate, translate by guess, complete, or correct missing emergency facts.
- One-tap call requires a verified callable number and user confirmation.
- Map handoff requires verified coordinates or address and uses Google Maps or Apple Maps URLs only.
- Show verification date, freshness, source, and limitations.

## Critical-error incident procedure

1. Suppress affected fields and actions immediately.
2. Present only an independently verified official fallback.
3. Preserve the report and publication evidence.
4. Verify through an independently obtained authority channel.
5. Check all records sharing the source.
6. Republish only after named human review.
7. Record impact, timing, cause, and prevention.
8. Seek qualified advice and notify affected parties where required.

## Approval state

- Emergency dataset readiness: **Evidence needed**
- Founder cadence approval: **Unresolved**
- Human safety reviewer: **Evidence needed**
- Publication authorization: **Not granted**
