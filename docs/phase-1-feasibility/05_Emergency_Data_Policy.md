# Emergency Data Policy

## Safety position

Emergency and assistance information is a first-class searchable domain. The product is an information aid, not an emergency service, and cannot guarantee response, language availability, opening status, or clinical suitability.

Official sources currently confirm core national numbers including police 191, medical emergency 1669, fire 199, and Tourist Police 1155 ([Thailand Government emergency list](https://thailand.go.th/issue-focus-detail/003_003?hl=en), [NIEM](https://www.niems.go.th/1/SubWebsite/?id=1096), [Tourist Police](https://www.touristpolice.go.th/main)). These facts must still be reverified immediately before publication.

## Source and verification matrix

| Service | Minimum acceptable source | Required verification | Cadence and stale threshold |
|---|---|---|---|
| Hospitals | Ministry/public-health register plus official hospital confirmation | Official name, type, address, coordinates, main phone, emergency capability if claimed, source, reviewer | Critical fields every 30 days; stale at 45 days |
| Clinics | Official regulator/public-health source plus direct facility confirmation | Name, clinic type, address, coordinates, phone, stated hours, source | Every 60 days; stale at 75 days |
| Pharmacies | Authorized health/pharmacy source plus direct confirmation | Name, address, coordinates, phone if shown, hours if shown; do not infer 24-hour status | Every 60 days; stale at 75 days |
| Police stations | Royal Thai Police or official station/local-government source | Official station name/type, address, coordinates, phone, jurisdiction note | Every 60 days; stale at 75 days |
| Tourist Police | Tourist Police Bureau source or direct station verification | Station/hotline, coverage, phone, address where relevant, language claims only if official | Hotline monthly; locations every 60 days |
| Rescue services | NIEM/local authority or formally identified authorized organization | Service owner, official role, dispatch/contact method, coverage; distinguish public EMS from private rescue | Every 30 days; stale at 45 days |
| Fire stations | Local authority/fire department or official government register | Official name, address, coordinates, phone if intended for direct contact, coverage note | Every 60 days; stale at 75 days |
| Emergency telephone numbers | Responsible national/local agency plus a second official confirmation where possible | Number, purpose, geographic scope, hours, language/service limitations, last test/confirmation method | Monthly; suppress on any unresolved conflict |
| Other assistance | Embassy/consulate, TAT, Tourist Police, local authority, or responsible service owner | Identity, purpose, eligibility, contact, hours, location, limitations | Every 60–90 days according to consequence |

Cadences are proposed policy, not legal or clinical standards. The founder and qualified local safety reviewer must approve them.

## Required fields

- Internal stable identifier and service category
- Thai and English official name
- Verified address and coordinates
- Phone number and whether it is a hotline, switchboard, or direct service line
- Geographic scope or jurisdiction
- Operating hours only when confirmed
- Capabilities only when directly supported
- Primary and corroborating sources
- Verification method, reviewer, date, and notes
- Last checked, next review, expiry, confidence, and dispute state
- Call and external-map eligibility

Never infer English availability, 24-hour operation, emergency department capability, medical specialty, cost, or response time.

## Publication and suppression

- Critical records require human review before first publication.
- Critical phone, address, coordinate, and classification assertions must pass the stricter freshness gate.
- Expired critical assertions are suppressed, not merely labeled stale.
- A record may remain visible with reduced fields only if the remaining fields independently pass policy.
- Conflicting official sources trigger immediate review and suppression of the disputed action.
- Cached emergency data carries its verification date and must not outlive the source policy.

## AI restrictions

- AI retrieves only currently publishable structured emergency records.
- AI cannot create, complete, translate, or “correct” numbers, addresses, facilities, capability claims, or hours from model memory.
- AI cannot rank emergency providers commercially.
- AI may summarize choices only without implying diagnosis or guaranteed suitability.
- If evidence is absent, the AI says it cannot verify and presents an approved official hotline or safe fallback.

## User actions

- Call action requires a verified callable number and a clear confirmation affordance.
- External-map action passes verified coordinates/address to Google Maps or Apple Maps.
- The interface displays service type, phone, address, verification date, freshness, and source.
- A private “report incorrect information” action is available on every record.
- No background location is collected; nearby search uses temporary consent or a manually chosen area.

## Disclaimers

Use short, prominent language stating that information may change, the app is not an emergency service, and users should contact official services directly. Do not bury the disclaimer or use it to excuse weak verification. Qualified legal and safety review is required before launch wording is approved.

## Critical-error incident response

1. Immediately suppress the affected assertion or record and disable its call/map action.
2. Display a safe official fallback where independently verified.
3. Preserve the report and publication evidence.
4. Contact the responsible authority through an independently obtained channel.
5. Assess whether related records share the same bad source.
6. Correct and republish only after human reverification.
7. Document user impact, root cause, response time, and preventive action.
8. Seek qualified advice and make notifications if required.

Target internal response: acknowledge critical reports promptly and suppress credible high-risk data immediately; exact service targets require founder approval and must reflect actual solo-founder coverage.

## Launch blocker

No destination activates until every emergency category has either adequate verified coverage or an explicitly approved and clearly presented limitation. A high tourist-attraction score cannot compensate for unsafe emergency data.
