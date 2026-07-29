# Image Rights Register

## Rule

No image may be published until the exact asset has evidence for the intended storage, transformation, display, attribution, commercial posture, and duration. A missing image uses a neutral category treatment, not a generated imitation of the real subject.

## Status vocabulary

**Proposed**, **Evidence needed**, **Partially verified**, **Verified**, **Rejected**, **Expired**.

## Asset categories

- First-party photography
- Business-authorized photography
- Partner-authorized photography
- Government or tourism-office material with explicit permission
- Open-license material
- Commissioned photography
- AI-generated decorative asset
- Prohibited or rejected source

## Asset register template

| Field | Value |
|---|---|
| Item/asset identifier | `[Required]` |
| Category | `[Controlled category]` |
| Depicted subject | `[Required]` |
| Real place or entity | `[Yes / no / not applicable]` |
| Photographer/creator | `[Required]` |
| Rights holder | `[Required]` |
| Owner/authority | `[Business/partner/agency]` |
| Source URL/document | `[Required]` |
| Evidence obtained | `[Agreement, assignment, license page, original file evidence]` |
| Rights claimed | `[Exact intended use]` |
| License/permission evidence | `[Controlled evidence path]` |
| Attribution requirement | `[Exact credit/link/notice]` |
| Modification rights | `[Crop/resize/compress/color/overlay/derivatives]` |
| Storage and CDN rights | `[Allowed scope and duration]` |
| Commercial-use rights | `[Allowed/prohibited/conditional/unknown]` |
| Platform/territory restrictions | `[Required]` |
| Acquisition date | `[YYYY-MM-DD]` |
| Expiry/recheck date | `[YYYY-MM-DD]` |
| Takedown status | `[None/requested/processing/completed]` |
| AI generation metadata | `[Provider/model/date/prompt reference, if applicable]` |
| Approved display contexts | `[Gallery/card/category/marketing/etc.]` |
| Restrictions | `[People/property/trademark/context limitations]` |
| Reviewer | `[Named reviewer]` |
| Status | **Evidence needed** |
| Notes | `[Required caveats]` |

## Category-specific evidence

- **First-party:** original file, capture record, photographer assignment/license, and releases where needed.
- **Business-authorized:** signed agreement, authority of submitter, creator/owner details, permitted transformations, duration, and takedown.
- **Partner-authorized:** contract plus per-asset identifier and feed/cache rules.
- **Government/tourism office:** asset-specific explicit permission or license; webpage publication is insufficient.
- **Open license:** asset page, author, license/version, source URL, attribution, modification record, and review of other rights.
- **Commissioned:** written commission and assignment/license plus releases.
- **AI decorative:** generation provenance and a documented non-documentary context.
- **Rejected:** evidence of rejection reason and removal completion.

## AI decorative safeguards

- Never place an AI-generated decorative image in a real-place, restaurant, dish, event, attraction, hospital, or emergency-service gallery.
- Do not use it as a real entity’s card thumbnail when users could infer documentary truth.
- Do not prompt it to imitate a named real business or facility.
- Label it when context may create ambiguity.
- Store no real-entity subject link except a prohibition/reference note.
- Do not replace a takedown image with an AI approximation of the same subject.

## Takedown workflow

Block new publication → disable public/CDN delivery → clear cache/search references → replace with neutral treatment → retain only permitted audit evidence → record completion and response.

## Prohibited sources

Google Images, Google Maps or Street View, social platforms, booking/review sites, general web search, government/business webpages without permission, unidentified stock assets, and user submissions without an agreement.

## Initial readiness

- Documentary assets verified: **None recorded**
- Business agreement: **Evidence needed; qualified legal review required**
- Accepted open licenses: **Founder decision unresolved**
- AI decorative use at launch: **Founder decision unresolved**
- Image publication authorization: **Not granted**
