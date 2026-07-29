# UI/UX Design Blueprint

## Experience objective

Help foreign tourists make confident decisions quickly on a small screen, in bright conditions, under time pressure, or with weak connectivity. This document defines experience requirements only and contains no screens or UI code.

## MVP primary journeys

- Start as a guest or sign in only when persistence requires it
- Create a trip with dates, destination, interests, and constraints
- Generate and revise a grounded itinerary
- Discover restaurants, authentic food, attractions, hidden gems, events, markets, walking streets, and activities
- Find nearby emergency and tourist-assistance services
- Save essential places and trip details
- Open a verified destination in Google Maps or Apple Maps
- Inspect sources, verification, freshness, uncertainty, image origin, and sponsorship
- Submit a private incorrect-information report
- Control language, location, conversation retention, and privacy choices

## Information architecture

- **Today:** current itinerary and relevant verified context
- **Trip:** dates, plans, saved items, and practical details
- **Explore:** approved places, food, attractions, events, markets, and activities
- **Assistance:** hospitals, clinics, pharmacies, rescue, police, fire, and tourist assistance
- **Companion:** grounded conversational help
- **Settings:** language, location, notifications if later added, privacy, and account controls

Labels and hierarchy require usability validation before implementation.

## External navigation flow

Place and assistance records provide “Open in Google Maps” and “Open in Apple Maps” actions where supported. The application hands off a verified name, coordinates, or address and communicates when a provider is unavailable. It does not show internal turn-by-turn directions, calculate routes, or act as a navigation engine.

## Emergency result requirements

An emergency or assistance result should clearly show, when verified and available:

- Service type
- Phone number
- Address and Thai-language name where useful
- Verification date
- Freshness status and limitations
- Call action
- Google Maps or Apple Maps action
- Source or authority information

Expired, disputed, or insufficiently verified critical data is suppressed or clearly unavailable. The interface must not let AI fill missing details. The product clearly states that it is not an emergency service.

## Interaction and trust principles

- Reveal value before requesting profile data.
- Keep AI suggestions editable and distinguish them from confirmed plans.
- Explain why a recommendation fits.
- Display freshness, verification, and sources near consequential information.
- Distinguish verified facts, estimates, sponsorship, and AI interpretation.
- Request precise location only at the moment of benefit and offer a manual-location alternative.
- Do not request background location in the MVP.
- Avoid hidden advertising, false urgency, and forced personalization.

## Images

Documentary images of real entities display only when their authorized use is active. Attribution appears wherever the license requires it. AI-generated decorative content must not appear in a real-place gallery or imply that it depicts a real venue, dish, event, attraction, hospital, or assistance service. It is labeled when context could otherwise mislead.

## Language and cultural design

The initial supported language set is unresolved and must be approved before implementation. Every supported language requires tested interface content and AI quality. Thai official names should remain visible for local communication and map handoff. The experience must handle Thai script, transliteration, local addresses, Thai currency, timezones, and Buddhist/Gregorian year ambiguity.

## Accessibility

Target WCAG 2.2 AA for the responsive web experience. Requirements include semantic structure, keyboard and screen-reader access, scalable text, adequate contrast, non-color status cues, generous touch targets, reduced motion, and accessible itinerary editing.

## Offline and failure experience

MVP offline support is limited to saved or cached essential trip data and previously retrieved verified assistance details where license and freshness rules permit. Show offline status, cache time, and unavailable actions. Complex synchronization, multi-user conflict resolution, and background syncing are post-MVP.

If free AI usage is temporarily limited, explain the temporary limitation and retain access to verified search, saved information, assistance records, and map handoff. Do not present a payment requirement.

## Booking boundary

The MVP does not perform internal hotel search, checkout, reservation management, or booking. Clearly disclosed external booking or affiliate links may be considered in a future phase.

## Future state

Native mobile, collaboration, richer offline packs, real-time alerts, additional languages, and partner commerce are future capabilities subject to evidence and operational readiness.
