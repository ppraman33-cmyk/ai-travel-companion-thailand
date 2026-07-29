# API Design

## Scope

This document defines application contract principles and capability boundaries. It intentionally contains no routes, payload schemas, executable specifications, or implemented APIs.

## MVP consumers

- One responsive traveler web application or PWA
- A minimal protected founder/editor administration module
- Approved bounded background jobs

## MVP capability groups

- Guest session or authentication, consent, and preferences
- Trips, itinerary proposals, and saved items
- Places, restaurants, food, attractions, events, markets, walking streets, and activities
- Emergency and tourist-assistance directory
- Grounded AI assistance
- Private incorrect-information reporting
- Internal record, provenance, license, verification, freshness, publication, expiry, and takedown operations
- Google Maps and Apple Maps handoff
- Usage limits and operational health

## Contract principles

- Use stable internal identifiers and predictable resource semantics.
- Enforce authorization server-side.
- Include locale, timezone, units, and currency context where relevant.
- Return verification, freshness, source, uncertainty, attribution, and sponsorship metadata where applicable.
- Protect provider credentials and vendor-specific payloads.
- Apply bounded pagination, filtering, validation, and response sizes.
- Use consistent user-safe errors with internal correlation identifiers.

## Map handoff

Map handoff contracts prepare an authorized destination name, coordinates or address, and a Google Maps or Apple Maps link or platform intent. They must support safe fallback when a provider application is unavailable. MVP contracts do not calculate routes, return turn-by-turn directions, optimize route order, or provide an internal navigation API.

## Emergency-directory behavior

Emergency results identify service type, verified phone and address assertions when available, verification date, freshness state, source information, and call or external-map actions. If a required critical assertion is expired, disputed, or below the approved reliability threshold, the response must suppress it or clearly return an unavailable state rather than guess.

## Content operations

Protected internal operations must be able to manage:

- Record and assertion provenance
- Source and provider references
- Verification and last-checked state
- Freshness and expiry
- License, attribution, and permitted use
- Publication and correction status
- Takedown and suppression
- Media origin classification

## AI and free-user controls

AI-facing contracts enforce per-user or per-device limits, global request limits, token budgets, maximum responses and itineraries, timeouts, abuse controls, and monthly provider budgets. Limit or budget errors must provide a free-service-safe fallback and must not imply that the tourist needs to pay.

Verified deterministic content and saved trip information remain available when the AI provider is unavailable or its budget is exhausted.

## External integration standards

Each adapter documents authorization, license terms, quota, cost, timeout, retention, cache restrictions, normalized errors, fallback, and provider exit behavior. Provider independence requires replaceable boundaries, not multiple launch implementations.

## Future-state contracts

Partner callbacks, affiliate tracking, commercial APIs, public reviews, collaboration, real-time alerts, native-client-specific contracts, and booking-related capabilities are post-MVP. An external hotel referral may be designed later; an internal hotel booking API is not planned for the MVP.

## Contract design gate

Before formal contract design, approve the consumer, purpose, authorization, privacy class, success and failure behavior, provenance obligations, idempotency need, rate and cost controls, compatibility policy, and test strategy.
