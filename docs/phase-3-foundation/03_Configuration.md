# Configuration

## Environments

The application recognizes `development`, `test`, and `production`. `config/env.ts` validates
public build-time configuration. Invalid values fail early. Secret provider credentials are
intentionally absent because Phase 3A connects no provider.

Copy `.env.example` to an ignored local environment file when local overrides are required. Never
commit credentials. Server-only secrets introduced later must not use the `NEXT_PUBLIC_` prefix and
must be loaded only by server-side composition code.

## Feature flags

The foundation defines flags for AI, events, emergency information, saved trips, accounts, admin,
and synthetic data. Product capabilities default to disabled. Synthetic data may be enabled for
development or test but validation rejects it in production.

Feature flags are release controls, not authorization controls. Server-side permission checks will
still be required for protected operations.

## Scope classification

- MVP foundation: anonymous sessions, deterministic catalog contracts, emergency verification,
  external map handoff, configuration, and safety boundaries.
- Post-MVP: saved trips, traveler accounts, and expanded operational capabilities.
- Future state: replaceable weather, translation, analytics, and other approved provider adapters.

Flags reserve these boundaries but do not implement or authorize their features.

## Provider replacement

Provider selection is represented as configuration, separate from domain models. AI and maps expose
interfaces rather than vendor SDK types. Weather, translation, and analytics are reserved
capabilities and have no adapters in this phase.

## Environments and secrets checklist

- Keep committed examples non-sensitive.
- Validate configuration at the application boundary.
- Never log tokens, cookies, authorization values, passwords, private keys, or provider secrets.
- Use separate credentials and projects for development, test, and production when integrations are
  approved.
- Rotate exposed credentials and invalidate compromised sessions; do not merely remove leaked text.
