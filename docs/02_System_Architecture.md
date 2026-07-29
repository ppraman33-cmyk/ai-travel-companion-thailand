# System Architecture

## Architectural goals

The system must be secure, observable, multilingual, provider-aware, and operationally realistic for a solo founder. Its geographic model supports all of Thailand while the initial content operation remains destination-bounded.

## MVP architecture

Use a **modular monolith** as the primary architecture. Deploy one responsive traveler web application or PWA and expose a minimal protected administration module within the same product boundary. Do not build web and native mobile applications simultaneously.

MVP logical modules:

- Identity or anonymous session, consent, and preferences
- Trips and itineraries
- Places, restaurants, food specialties, attractions, and local experiences
- Events, markets, walking streets, and activities
- Emergency and tourist-assistance directory
- Search and saved items
- AI orchestration and evaluation
- Provenance, licensing, verification, and publishing
- Private corrections and audit history
- Provider adapters, quotas, cost telemetry, and operational health

One module may have clear internal boundaries without becoming an independently deployed service.

## MVP runtime topology

- A responsive client communicates with one versioned application boundary.
- A stateless application process enforces authorization and domain rules.
- A primary transactional data store holds business truth.
- Authorized media uses replaceable storage and delivery interfaces.
- Search begins with capabilities supported by the primary store unless measured needs justify a dedicated engine.
- Small, bounded background tasks may use a simple managed scheduler or job mechanism.
- Deterministic verified content remains usable when AI or another optional provider fails.

Dedicated search clusters, event streams, analytics warehouses, distributed caches, complex queues, dead-letter systems, and independently deployed services are future options, not MVP requirements.

## Nationwide-ready domain boundary

Stable internal identifiers and geographic hierarchy must support country, province, district, subdistrict, locality, and coordinates without requiring every Thai location to be populated at launch. Content activation is controlled by destination readiness rather than by schema changes.

## Navigation boundary

The application provides destination handoff through documented Google Maps and Apple Maps links or platform intents. A handoff adapter encapsulates provider-specific formats and fallback behavior. The product does not build route calculation, turn-by-turn directions, route optimization, or an internal navigation engine.

## Provider independence

Define narrow internal interfaces for:

- AI generation and embeddings where used
- Weather
- Translation
- Analytics
- Google Maps and Apple Maps handoff
- Media storage and delivery
- Other approved external integrations

Provider independence does not require multiple live providers at launch. The MVP may use one approved implementation per capability if provider identifiers, credentials, errors, quotas, and vendor-specific payloads do not leak into core domains.

## AI interaction

The application retrieves approved records, supplies bounded authorized context, generates a candidate response, validates required grounding, and returns citations, verification, freshness, and limitations. Structured content access and normal authorization remain outside model control.

## Cost and outage controls

Each metered provider requires:

- Per-user or per-device and global request limits
- Token, response-size, itinerary-size, and latency limits where applicable
- A monthly budget and warning thresholds
- Usage and cost telemetry by feature
- Timeouts, bounded retry, and circuit-breaking behavior
- Cache rules consistent with freshness, privacy, and license terms
- A deterministic or clearly communicated degraded mode

Budget exhaustion must not imply that payment by the traveler is required. Verified saved and directory content must remain available.

## Reliability and security

- Apply server-side authorization, input validation, output encoding, and secret isolation.
- Use idempotency only where retries can duplicate changes.
- Back up primary state and test restoration.
- Record privileged changes and important publication transitions.
- Treat external data and retrieved content as untrusted.
- Use feature flags or simple controlled rollout for high-risk functions.
- Degrade stale information according to domain policy; suppress unsafe emergency records.

## Future-state architecture

Native mobile clients, dedicated search, richer offline support, event-driven processing, data warehouses, multiple provider implementations, automated ingestion, partner integrations, and service extraction may be added only after measured demand or operational risk justifies them.

## Decisions required before implementation

- Launch destination or bounded region
- Supported languages
- Hosting region and primary managed stack
- Identity or guest-session approach
- Primary AI, translation, weather, analytics, and media providers
- Monthly cost ceiling and provider budgets
- Data backup and recovery targets
