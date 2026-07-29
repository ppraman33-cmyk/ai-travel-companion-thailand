# User Flows

## Shared behavior

All development screens display `TEST DATA — NOT REAL TRAVEL OR EMERGENCY INFORMATION` when synthetic records are present. Public real-content states require evidence gates not yet satisfied. Precise location is optional, transient, and replaceable by manual area selection. Trust panels show source, verification date, freshness, limitations, and image attribution.

## Flow specifications

### 1. First visit

- Entry: PWA root or shared public link.
- Actions: read coverage notice; choose English; continue as guest.
- System: explains free access, proposed coverage, location choice, and synthetic environment when applicable; creates no session until needed.
- Empty/error: static welcome remains available if services fail.
- Trust/privacy: no location or account request; publication limitations visible.
- Acceptance: user can reach Explore and Assistance without registration.

### 2. Anonymous session creation

- Entry: first save, trip, preference, or AI action.
- Actions: accept essential session notice; optionally select consent choices.
- System: creates opaque session and local cache; shows expiry/recovery limitation.
- Empty/error: action stays unsaved with retry; browsing continues.
- Trust/privacy: no fingerprint, email, phone, or background location.
- Acceptance: secure session supports ownership and deletion; failure does not block public content.

### 3. Selecting interests

- Entry: onboarding or Trip settings.
- Actions: select food, culture, markets, nature, local experiences, accessibility/dietary needs; skip allowed.
- System: stores explicit selections in session/trip and explains use.
- Empty/error: defaults to unpersonalized discovery; failed save is visible.
- Trust/privacy: sensitive preferences optional and editable.
- Acceptance: choices affect explanations, not safety or commercial ranking.

### 4. Discovering nearby places

- Entry: Home/Explore “Near me” or manual area.
- Actions: grant one-time location or choose area; filter categories.
- System: processes coordinates transiently, returns verified/synthetic catalog sorted by relevance and distance estimate only if available.
- Empty/error: offer broader manual area; never query unrestricted web.
- Trust/privacy: location-use explanation and freshness badges.
- Acceptance: denied location preserves manual search; no location history stored.

### 5. Searching for local food

- Entry: Explore/Search/Food.
- Actions: enter Thai/English/transliterated term; filter cuisine, specialty, dietary attribute.
- System: resolves aliases against approved catalog; distinguishes specialty concept from restaurant.
- Empty/error: spelling/area suggestions; “no verified result,” not invented venues.
- Trust/privacy: evidence shown for claims; no paid ranking.
- Acceptance: every returned restaurant resolves to one Place ID.

### 6. Viewing a place

- Entry: result, saved item, itinerary item, or deep link.
- Actions: inspect details, sources/media, save, add to trip, open map.
- System: composes common Place plus subtype; omits suppressed facts.
- Empty/error: text-first detail if no authorized image; unavailable state if unpublished.
- Trust/privacy: verification/freshness, attribution, synthetic label.
- Acceptance: map action uses verified destination and external provider.

### 7. Viewing an event or market

- Entry: Events/Explore/result.
- Actions: choose occurrence, inspect status, save/add to trip.
- System: separates event concept from occurrence; highlights cancellation/rescheduling.
- Empty/error: no active occurrence state; never reuse expired date.
- Trust/privacy: organizer/source, last check, occurrence freshness.
- Acceptance: cancelled/expired occurrence cannot be added as confirmed current activity.

### 8. Finding emergency assistance

- Entry: persistent Assistance navigation or Home.
- Actions: choose category; optionally share one-time location/manual area; inspect, call, open map.
- System: returns only current structured emergency fields; no commercial ranking.
- Empty/error: show that verified results are unavailable; offer independently approved official fallback only.
- Trust/privacy: prominent verification date, limitations, temporary location use, “not an emergency service.”
- Acceptance: stale critical phone/address/coordinate disables related action; AI never fills gaps.

### 9. Creating a trip

- Entry: Trip navigation.
- Actions: enter dates, title, interests, constraints.
- System: validates timezone/date/size; creates days; keeps account optional.
- Empty/error: empty-day guidance; local draft recovery if safe.
- Trust/privacy: expiry and device-loss limitation explained.
- Acceptance: owner session alone can access; manual editing works without AI.

### 10. Asking AI for an itinerary

- Entry: Trip “Plan with AI.”
- Actions: review context, submit request, wait/cancel.
- System: classifies request, retrieves allowed verified/synthetic records, generates and validates proposed items/citations, records quota/cost.
- Empty/error: deterministic suggestions/search when AI unavailable.
- Trust/privacy: bounded context and retention notice; AI proposals labeled.
- Acceptance: no item references outside allowed entity IDs; traveler must confirm.

### 11. Revising an itinerary

- Entry: AI chat or itinerary item.
- Actions: request changes or manually reorder/remove/confirm.
- System: preserves confirmed decisions unless explicitly included; returns a proposed diff.
- Empty/error: manual edit remains available.
- Trust/privacy: citations and changed-source warnings.
- Acceptance: revision conflict never silently overwrites newer trip state.

### 12. Saving a place

- Entry: card/detail.
- Actions: tap Save; optionally associate with trip.
- System: creates session if needed; idempotently stores bookmark.
- Empty/error: optimistic state rolls back with retry.
- Trust/privacy: guest expiry explanation accessible.
- Acceptance: repeated save creates no duplicate.

### 13. Opening external navigation

- Entry: Place, itinerary, or emergency detail.
- Actions: select Google Maps or Apple Maps; confirm leaving app.
- System: generates URL from verified name/coordinates/address; records non-sensitive handoff event.
- Empty/error: offer copyable verified address; suppress action if destination data unsafe.
- Trust/privacy: no route calculation or background tracking.
- Acceptance: links open provider/browser and never imply in-app navigation.

### 14. Reporting incorrect information

- Entry: any detail or source panel.
- Actions: choose field/category, describe issue, optionally provide contact/evidence.
- System: creates private report, acknowledges reference, prioritizes safety categories.
- Empty/error: bounded retry/copy option; no public posting.
- Trust/privacy: reporter contact optional with retention notice.
- Acceptance: report cannot automatically change or verify a record.

### 15. AI quota reached

- Entry: AI action after limit.
- Actions: view retry time; continue manually.
- System: returns `AI_QUOTA_EXCEEDED`, remaining deterministic capabilities, no payment prompt.
- Empty/error: never consume another chargeable request.
- Trust/privacy: do not expose abuse signals.
- Acceptance: Trip, Explore, Assistance, Saved, and map handoff work.

### 16. AI unavailable

- Entry: provider outage, budget kill switch, validation failure.
- Actions: use search/manual trip; retry later.
- System: returns provider-neutral message; no unapproved paid fallback.
- Empty/error: deterministic catalog remains.
- Trust/privacy: do not show provider internals or raw partial output.
- Acceptance: emergency access unaffected.

### 17. No verified result available

- Entry: search/discovery/AI retrieval with no publishable match.
- Actions: adjust query/area/category; submit correction/source suggestion privately.
- System: states no verified result and avoids unrestricted web facts.
- Empty/error: clear distinction from network failure.
- Trust/privacy: explains coverage boundary and verification standard.
- Acceptance: no invented entity, contact, hours, or event.

### 18. Stale or suppressed emergency information

- Entry: cached/deep-linked emergency record or current directory.
- Actions: view limitation; use approved alternative if available.
- System: removes stale critical fields and actions; records no AI completion.
- Empty/error: full suppression when nothing safe remains.
- Trust/privacy: reason category and last verified date without internal-sensitive notes.
- Acceptance: stale call/map actions cannot be invoked; incident/report path available.

## Post-MVP flows

Accounts, cross-device recovery, collaboration, public reviews, booking links, notifications, sponsored placements, live weather, and rich offline synchronization are deferred.
