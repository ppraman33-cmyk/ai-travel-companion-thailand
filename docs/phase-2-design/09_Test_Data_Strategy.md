# Test Data Strategy

## Objective

Enable complete internal development without publishing or implying real Thailand information. Synthetic data must be obvious to humans, machines, logs, exports, screenshots, and AI.

## Naming and safety rules

- Use “Test,” “Synthetic,” or “Example” in every public-facing entity name.
- Use fictional geography such as `Test Province`, `Example District`, and `Synthetic Quarter`; do not attach synthetic entities to real Chiang Mai coordinates.
- Use reserved domains such as `example.invalid`.
- Use non-callable strings such as `NOT-CALLABLE-TEST-001`; do not format them as valid Thai phone numbers.
- Use coordinates in a documented non-production test space or omit them; never place a synthetic emergency marker on a real facility.
- Use clearly generated neutral assets carrying `SYNTHETIC TEST ASSET`.
- Set `synthetic=true` on every root and propagate through derived records.
- Production publication rejects any synthetic root or dependency.

## Synthetic categories and minimum development set

| Category | Minimum | Coverage |
|---|---:|---|
| Geography | 1 country-like test root, 2 provinces, 3 districts, 5 localities, 2 coverage areas | hierarchy, aliases, active/inactive boundary |
| Common Places | 30 | duplicates, multiple subtypes, missing optional fields, suppressed states |
| Restaurants | 12 | cuisines, dietary evidence, specialties, unknown hours |
| Food specialties | 8 | many-to-many restaurant links and bilingual names |
| Attractions | 10 | categories, accessibility, hidden-gem editorial flag |
| Events | 8 concepts / 16 occurrences | recurrence, reschedule, cancellation, expiry, venue override |
| Markets/walking streets | 4 | recurring schedule and Event relationship |
| Local activities | 6 | Place-based and area-based |
| Emergency services | 12 | all service categories, verified/stale/disputed/suppressed fields |
| Media assets | 20 metadata records | all origin/right states; no misleading real images |
| Sources/licenses | 12 sources / 8 licenses | approved, conditional, expired, rejected, takedown |
| Assertions/verifications | 80 assertions / 40 verifications | conflicts, expiry, critical fields |
| Sessions/trips | 20 sessions / 15 trips | expiry, ownership, limits, deletion |
| AI conversations | 30 request/response cases | grounded, refusal, quota, outage, injection |
| Reports/audit | 15 reports / 80 audit events | priority, resolution, immutable history |

## Example pattern

Use descriptions like:

- `Synthetic Lantern Test Restaurant`
- `Example River Test Attraction`
- `Test Walking Street — Not a Real Event`
- `Synthetic Clinic — Do Not Call`
- URL: `https://synthetic-clinic.example.invalid`
- Contact: `NOT-CALLABLE-TEST-002`

Examples are conventions, not seed files.

## Media and license data

Synthetic image files or metadata must not imitate a named real place. Test licenses are labeled `TEST-LICENSE-NOT-LEGAL` and never reused as real terms. Rights workflows test expiry/takedown without asserting any actual license.

## Environment isolation

- Development/test environments allow synthetic data.
- Production data access rejects synthetic creation unless a separately isolated test tenant exists and cannot reach public endpoints.
- Every logical API response includes `synthetic_data`.
- PWA shows a persistent test banner and per-record badge.
- Exports, screenshots, AI prompts, monitoring, and email subjects retain test labeling.
- CI checks that synthetic fixtures contain reserved domains/non-callable contacts and no real emergency numbers.

## AI test conversations

Prompts explicitly state the catalog is synthetic. The model may refer only to supplied synthetic IDs. Include requests to invent a missing venue, reveal system instructions, use a stale emergency phone, browse the web, book a hotel, diagnose symptoms, and create internal directions; correct behavior is refusal or bounded fallback.

## Data reset and retention

Synthetic sessions and conversations may be regularly reset. Preserve only minimal reproducible fixture definitions and failing test cases. Do not mix real user reports or provider logs into fixture data.

## Promotion prohibition

There is no conversion from synthetic to real. A real record must be created through the real rights/provenance workflow. Copying synthetic prose into a real record requires normal review and must not carry fabricated assertions.

## Future test data

Optional accounts, collaboration, reviews, affiliate/sponsored content, weather, and notifications receive fixtures only when those post-MVP features are approved.
