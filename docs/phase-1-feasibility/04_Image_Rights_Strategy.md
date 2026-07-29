# Image Rights Strategy

## Objective

Use real documentary images only when the project can prove the right to store and display them. A record may launch without an image; missing imagery is safer than uncertain rights or misleading AI content.

## Acquisition paths

| Path | Proof required | Risk and MVP position |
|---|---|---|
| First-party photography | Original file, photographer identity, capture date, subject, written assignment/license, releases where needed | Lowest controllable risk; primary recommendation |
| Business-submitted images | Signed submitter agreement, uploader identity/authority, creator/owner details, original file or evidence | Recommended after a simple rights workflow |
| Government/tourism-office images | Written permission or explicit license tied to each asset | Useful, but a government webpage alone is not permission |
| Openly licensed images | Asset-page snapshot, author, exact license/version, source URL, attribution, modification record | Selective use after manual verification |
| Commissioned photographer | Contract assigning or broadly licensing intended use; releases and delivery manifest | Low legal ambiguity but paid |
| Authorized partner feed | Contract and per-asset identifiers, caching, transformation, attribution, expiry, and removal terms | Future option; operationally heavier |
| AI-generated decorative assets | Generation record, model/provider, prompt or production brief, date, reviewer, permitted category | Decorative only; never documentary |

Wikimedia Commons allows reuse under varying licenses but warns that it does not warrant each file’s copyright status; each asset still needs verification ([reuse guidance](https://commons.wikimedia.org/wiki/Commons%3AReusing_content_outside_Wikimedia/en)). Creative Commons variants differ on attribution, derivatives, share-alike, and commercial use ([license overview](https://creativecommons.org/share-your-work/cclicenses/)).

## Required rights record

- Asset identifier and classification
- Real-world subject, if any
- Creator, copyright owner, and submitting party
- Source URL/document and acquisition date
- License name, version, or signed agreement
- Proof file or immutable evidence reference
- Territory, duration, platforms, commercial status, and sublicensing
- Storage, CDN, caching, crop, resize, compression, color, and format rights
- Required credit, license link, and modification notice
- People/property/model-release status where relevant
- Expiry, withdrawal, takedown, and replacement status
- Reviewer and review date

## Business submission agreement requirements

The business should warrant that it owns the image or has authority to grant the agreed rights; identify the creator; grant storage, display, reasonable technical transformation, CDN, and promotional rights for a defined term and territory; confirm required releases; disclose attribution; permit the project to retain proof and audit history; accept correction/takedown procedures; and indemnity or liability language only if qualified counsel recommends it.

This is a requirements list, not legal wording. A qualified lawyer should draft or review the agreement.

## Asset classes

- `documentary_first_party`
- `documentary_business_authorized`
- `documentary_partner_authorized`
- `documentary_open_license`
- `decorative_ai_generated`
- `decorative_non_ai`
- `restricted_internal_only`
- `expired_or_takedown`

Documentary assets must map to a verified subject. Decorative assets cannot populate real-place galleries or place cards in a way that implies documentary truth.

## Attribution and transformation

- Generate attribution from recorded fields; do not rely on filename or free text.
- Show author, source, license link, and modification notice as the exact license requires.
- Do not crop, retouch, overlay, or generate derivatives unless permitted.
- Preserve the original and a transformation manifest when lawful.
- Treat “no derivatives,” “noncommercial,” and share-alike licenses as requiring explicit review before MVP use.

## Expiry and takedown

1. Immediately prevent new publication.
2. Remove public derivatives and CDN access within the contractual or approved deadline.
3. Clear search/cache references.
4. Substitute a neutral placeholder rather than an AI image of the real entity.
5. Retain minimum rights/audit evidence only where permitted.
6. Record completion and notify the claimant or provider as required.

## Prohibited sources

- Google Images or other general image search results
- Google Maps, business-profile, review, or street-view imagery
- Facebook, Instagram, TikTok, blogs, or booking platforms without explicit asset permission
- Images copied from government or business websites without a license
- Stock or open-media files whose subject, author, or rights cannot be verified
- User uploads without an agreement and moderation process
- AI images presented as real places, dishes, events, attractions, hospitals, or services

## Lowest-risk MVP strategy

1. Launch records with text and neutral category icons when no image is authorized.
2. Use a small first-party photography set for flagship public places and food categories.
3. Add business-submitted images under a reviewed standard agreement.
4. Use carefully verified CC0/CC BY assets sparingly.
5. Use AI generation only for obvious decorative category backgrounds or marketing, with disclosure where ambiguity is possible.

## Founder decisions

- Budget for first-party or commissioned photography
- Whether business submissions are included in the first pilot
- Which open licenses are accepted
- Whether any decorative AI imagery is needed at launch
- Qualified legal reviewer for the agreement and takedown procedure
