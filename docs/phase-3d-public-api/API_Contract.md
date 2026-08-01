# Phase 3D Public API

## Endpoint inventory

The versioned catch-all handler implements catalog resources under `/api/v1/`:

- `destinations`
- `places`
- `restaurants`
- `attractions`
- `foods`
- `events`
- `event-occurrences`
- `emergency-services`
- `sessions`
- `trips`
- nested Trip `items`
- `saved-places`
- `reports`
- disabled-safe `assistant`

GET supports catalog list/detail and traveler-owned Trip/saved reads. POST supports session issuance,
Trip/item creation, saves, and reports. PATCH uses the same validated bounded update contract.
DELETE supports current-session revocation, owned Trip/item deletion, and saved-Place removal.

## Contracts

Responses use `{ data, error, meta }`, include a correlation/request ID, and expose provider-neutral
codes only. Runtime Zod validation covers UUIDs, locale, bounded text, dates, page size, filters,
Trip state, and itinerary targets. Pages are ID ordered, limited to 50, and return an opaque-next-ID
cursor. Catalog persistence runs through RLS-backed application/infrastructure services.

Public DTOs contain only traveler-facing identity, category, destination, address, coordinates,
event time, and information-check time. They omit reviewer identity, private evidence, internal
notes, audit, confidence, session secrets, and service-role information.

## Anonymous session security

The server creates a 256-bit random session secret and stores only SHA-256. The secret is an
HttpOnly, SameSite=Strict cookie and Secure in production. A separate readable CSRF token must match
the mutation header. Origins are validated for session creation and mutations. Expiry is bounded to
30 days, revocation is supported, and UUIDs alone never establish ownership.

## Rate limits and failures

An injectable rate limiter applies separate read/write windows. The current in-memory implementation
is a process-local boundary suitable for development; durable distributed enforcement is required
before multi-instance production. Missing database configuration returns Unavailable. No endpoint
falls back to synthetic catalog data.
