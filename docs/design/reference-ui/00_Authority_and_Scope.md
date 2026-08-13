# Reference UI Authority and Scope

## Authority

The numbered Screen 01–35 plates in `แอปท่องเที่ยว 2.zip` are the visual authority for the Reference UI Alignment Program. The other 34 images are supplemental guidance only. When guidance conflicts, the numbered plate wins. Reference files are never repository assets.

## Founder-approved product contract

- Primary navigation is Home, Explore, AI, Saved, Profile. Trips are contextual.
- Mobile information hierarchy is authoritative; larger layouts retain its order.
- Prompt is the preferred Thai/English typeface, with safe system fallbacks until a licensed local font asset is approved.
- Attraction Detail uses Screen 15, supplemented by non-conflicting Screen 10 elements.
- Saved follows Dashboard → List/Collection → Detail.
- Profile represents secure anonymous Travel Profiles, not registered accounts.
- Live AI, internal navigation, Premium, Membership, Points, Payment, Partner, Billing, Sponsored, Campaign, Promotion, hotel booking and unverified Emergency actions are excluded.
- Google Maps and Apple Maps are confirmation-based external handoffs only.
- Mascot artwork is an empty placement slot until ownership and usage rights are verified.
- Real-place media is replaced by clearly labelled code-native synthetic media.
- Reference maps and counts are not factual sources. The application uses only the verified 77-province contract.

## Architecture boundary

Alignment must preserve `Result<T, AppError>`, HttpOnly anonymous sessions, server ownership checks, RLS and audited RPC boundaries, publication/evidence gates, CSP nonce behavior, deterministic personalization, locale behavior and fail-closed safety states. UI needs that lack an approved persistence contract remain disabled or read-only.

## Delivery

Screens 01–35 are delivered in Draft PR #7 through Checkpoints A–G. The program does not merge, deploy, publish or release.
