# Domain Implementation

## Purpose

Phase 3A turns the approved architecture into a buildable, testable project shell. It establishes
boundaries and contracts only. It does not implement travel discovery, itinerary generation,
emergency publication, artificial intelligence behavior, external provider connections, admin
workflows, or persistent storage.

## Contract scope

- Next.js App Router, React, TypeScript, and Tailwind CSS application shell
- Domain, application, infrastructure, provider, shared, and UI boundaries
- Domain model and repository contracts without persistence implementations
- Provider-independent AI and external-map handoff contracts
- Anonymous traveler-session boundary
- Environment parsing, feature flags, errors, results, logging, validation, and security headers
- Unit and end-to-end test foundations using synthetic data only
- Continuous integration for type checking, linting, unit tests, and production builds

## Domain model

The common `Place` identity is represented by a base contract with restaurant, attraction, and
emergency-service subtypes. Food is a culinary concept rather than a physical location. Events are
separate dated concepts that may reference host and venue Places. Related contracts cover trips,
itineraries, media, verification, provenance, licensing, sessions, administration, auditing, AI
requests and responses, and incorrect-information reports.

Publishable root contracts carry an explicit `real` or `synthetic` data classification. Phase 3A
defines no publication-state transition, so no synthetic contract can enter a production
publication state. Emergency services additionally require an emergency-specific verification
contract with a checked date, next-check date, critical-field decision, and only verified or
suppressed states.

Domain repository interfaces cover places, trips, emergency information, media, sources, AI audit
records, and verification. Application service interfaces describe intended use-case boundaries
without implementing business behavior.

## Architectural rule

Dependencies point inward:

1. UI may depend on application contracts and shared utilities.
2. Application contracts may depend on domain types and shared utilities.
3. Infrastructure and provider adapters may depend on application or domain contracts.
4. Domain code does not depend on UI, framework, infrastructure, or provider code.
5. UI must never import infrastructure directly.

Concrete business services and infrastructure adapters will be created only in approved later
batches and must be injected at composition boundaries. Singleton business services are prohibited.

AI requests carry an explicit allowlist of deterministic catalog record identifiers, and responses
carry cited catalog identifiers. These types establish grounding requirements; they do not generate
responses. Map contracts create external Google Maps or Apple Maps handoffs only; there is no route
calculation or navigation engine.

## Explicit exclusions

No real place, event, emergency, contact, provider, or image data is included. There is no database
schema, SQL, migration, table, Supabase client, provider credential, external API call, internal
navigation engine, hotel booking, or generated travel advice.
