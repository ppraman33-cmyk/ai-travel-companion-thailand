# Data Sources and Governance

## Objective

Build a lawful, traceable, fresh, and operationally sustainable Thailand travel knowledge base. The information model supports nationwide expansion, but only destinations meeting the activation standard are operationally published.

## Publication gate

Authorization, license status, provenance, verification, and domain-specific freshness are mandatory publication decisions. A reachable webpage is not evidence of permission to copy, store, transform, redistribute, translate, or use content with AI.

Unlicensed scraping is prohibited. General image search may be used to discover a possible rights holder but not to acquire or publish an image.

## Source hierarchy

1. Thai government, emergency, health, park, transport, weather, and tourism authorities
2. Official local authorities, operators, venues, businesses, and event organizers
3. Licensed commercial providers with documented terms and quality commitments
4. Curated editorial partners and qualified local experts
5. Private traveler reports as verification signals, not published fact

Social posts and unverified pages may support discovery but do not establish consequential facts.

## Provenance levels

### Record-level provenance

Every place, restaurant, event, market, emergency service, and media asset records its originating sources, acquisition, rights, verification, confidence, and review status.

### Assertion-level provenance

Opening hours, event and occurrence dates, cancellation or rescheduling, phone numbers, fees, addresses, emergency classification, availability, and other volatile facts should reference their specific evidence where practical.

Applicable provenance includes source, source type, source URL or document, provider identifier, license, attribution, permitted use, acquisition date, verification status and date, last checked date, expiry date, takedown status, reviewer notes, and confidence or reliability.

## Image-source policy

Permitted origins are:

- First-party photographs captured with documented rights
- Images explicitly authorized by the represented business or operator
- Images supplied under an approved partner agreement
- Openly licensed images whose license permits the intended storage, transformation, attribution, and distribution
- AI-generated decorative assets governed by the decorative-image policy

Real-place documentary images must identify the represented subject and retain their license and attribution chain. Provider terms may prohibit caching or reuse; such images are displayed only within those terms.

AI-generated images may be used for decorative, category, branding, marketing, or atmospheric content. They carry generation provenance and cannot be associated as documentary proof of a real place, restaurant, dish, event, attraction, hospital, or emergency service. Misleading contexts require disclosure or exclusion.

## Emergency-source requirements

Emergency-service data requires an authoritative official source or documented direct verification. Critical phone, address, location, classification, and operating-status assertions use stricter freshness and confidence thresholds. Conflicts, expiry, or credible correction reports trigger suppression until reverified.

The destination cannot activate without adequate verified coverage for hospitals, clinics, pharmacies, rescue, police, fire, and tourist assistance, or an explicitly approved limitation that is clearly communicated.

## Event verification

Events, festivals, markets, and walking streets require dated evidence, organizer or authority, recurrence pattern where applicable, occurrence exceptions, last check, and status. Cancellation or rescheduling updates supersede the active occurrence without erasing historical evidence. Expired occurrences do not appear as current.

## Ingestion lifecycle

Acquire under approved terms → quarantine → validate → normalize → resolve identity → attach provenance and license → verify → publish → monitor → correct, expire, suppress, archive, or remove.

The MVP prefers manual curation or lightly assisted import over complex automated ingestion.

## Provider exit, expiry, and takedown

Each provider and license requires an exit plan defining:

- Which records or assertions must be removed or replaced
- Whether derived content may remain
- Cache, search, backup, and media cleanup obligations
- Attribution changes
- Deadline and responsible reviewer
- Evidence retained for audit where lawful

Takedown and expired-license states must propagate to public delivery. Rights and legal conclusions require qualified review; the project must not claim compliance merely because metadata exists.

## Destination activation standard

Before activating a destination, confirm:

- Authorized coverage across the MVP discovery domains
- Verified emergency-service coverage and review cadence
- Authorized real-place images or an acceptable no-image presentation
- Required supported-language content quality
- Provenance and license completeness
- Freshness thresholds and sustainable review volume
- Correction and takedown readiness
- Monthly provider and content-maintenance cost within budget

## Future data

Accommodation, booking inventory, public reviews, sponsored content, and commercial offers are outside the MVP. External accommodation referrals may be evaluated later under separate source, disclosure, and consumer-protection review.
