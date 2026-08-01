# Repository Adapters

## Implemented adapters

- `PlacePersistenceAdapter`
- `TripPersistenceAdapter`
- `EmergencyPersistenceAdapter`
- `MediaPersistenceAdapter`
- `SourcePersistenceAdapter`
- `VerificationPersistenceAdapter`

They implement only the methods already approved in the domain repository interfaces.

## Mapping and errors

Database row types, insert types, and update types live in the Supabase infrastructure boundary.
Explicit mapper functions create domain-safe objects. Raw database field names and Supabase response
types do not cross into domain or application layers.

Unique violations map to Conflict, relational/check violations to Validation, RLS failures to
Permission, and other provider failures to retryable Provider errors. Messages omit SQL and
sensitive implementation detail.

## Injection and clients

Adapters receive a `PersistenceClient`; there is no service locator or singleton. The Supabase
implementation is replaceable by a fake for unit tests. Public and service-role construction are
separate, and no module initializes a client automatically.

## Query boundaries

ID lists use deterministic ID ordering and bounded limits. Emergency lookup uses a small coordinate
window and hard limit as a foundation, not search ranking or route computation. Place relations load
typed provenance, media, and verification links. Trip upsert is the only write adapter currently
required by the approved interface.

Transactions spanning multiple repositories, cursor APIs, full-text search, PostGIS, bulk
publication, admin workflow services, and AI retrieval are intentionally deferred.
