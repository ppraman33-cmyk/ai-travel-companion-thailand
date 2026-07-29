# Database Design

## Purpose

This document defines conceptual information entities, ownership, lifecycle, and quality rules. It intentionally contains no physical tables, columns, indexes, migrations, or vendor-specific schema.

## Design principles

- Support nationwide geography without requiring nationwide launch content.
- Keep one authoritative owner for each business concept.
- Separate curated, imported, user-created, and AI-derived information.
- Preserve record-level provenance and assertion-level provenance where facts are volatile or consequential.
- Keep provider identifiers separate from stable internal identifiers.
- Treat search, cache, and analytics as projections rather than business truth.
- Minimize personal data and make deletion and retention explicit.

## Geographic model

Conceptual geographic entities support Thailand, provinces, districts, subdistricts, localities, and geographic points or boundaries. Launch activation and content coverage are independent of geographic structure. The MVP populates only the approved destination or region.

## Core conceptual entities

### Traveler, trip, and itinerary

A traveler or anonymous session may hold language and explicitly supplied preferences. A trip contains dates, destinations, constraints, saved items, and itinerary entries. AI proposals remain distinguishable from traveler-confirmed decisions.

### Place

A stable real-world identity with multilingual names, geography, categories, address context, publication state, verification state, and provider references. It is the common location identity for specialized records.

### Restaurant and food specialty

A restaurant describes an authorized real venue and food-service attributes. A food specialty describes a regional dish, ingredient, or culinary tradition and does not imply a particular venue unless linked by verified evidence.

### Attraction

A verified point or area of visitor interest, including cultural, natural, historic, and community attractions.

### Event and recurring event occurrence

An event describes the enduring concept; an occurrence describes a dated instance. Recurrence rules, exceptions, cancellation, rescheduling, status, effective dates, and historical expiry must remain explicit.

### Market or walking street

A specialized recurring or scheduled local experience with location, operating pattern, occurrence exceptions, and verification. It may also qualify as an attraction or event without duplicating its stable identity.

### Emergency service

A first-class searchable record for hospitals, clinics, pharmacies, rescue services, police stations, fire stations, and tourist assistance. It includes service classification, contact and location assertions, verification state, freshness class, and safe suppression behavior.

### Media asset

An image or other approved media item with origin category, subject association, source, license, attribution, permitted use, acquisition date, verification, expiry, takedown state, and storage reference.

Allowed image origin categories:

- First-party real image
- Business-authorized image
- Partner-authorized image
- Openly licensed image
- AI-generated decorative image

AI-generated decorative assets may not be classified or displayed as documentary media for real entities.

### Source

An authority, organization, provider, publication, first-party collection, or approved document from which facts or media originate. It records source type, owner, access method, quality assessment, and applicable terms.

### Source assertion

Evidence for a specific fact, value, or claim. Opening hours, event dates, phone numbers, fees, addresses, emergency classifications, status, and similar volatile facts should have assertion-level provenance where practical.

### License

Rights and restrictions associated with data or media, including license type, attribution requirement, permitted use, transformation or redistribution constraints, expiry, and termination conditions.

### Verification

A review or automated quality decision with status, date, method, reviewer notes, last checked date, confidence or reliability, and next review or expiry date.

### External provider reference

A mapping between an internal record and a provider identifier. Provider references are replaceable and do not define internal identity.

## Provenance requirements

Every place, restaurant, event, emergency service, media asset, and material volatile assertion must support, where applicable:

- Source and source type
- Source URL or source document
- Provider identifier
- License type
- Attribution requirement
- Permitted use
- Acquisition date
- Verification status and date
- Last checked and expiry dates
- Takedown status
- Reviewer notes
- Confidence or reliability level

No record is publishable unless its required provenance and license state pass the domain’s publication policy.

## Emergency and stale-data behavior

Emergency records use stricter verification intervals than ordinary travel content. Expired or materially uncertain contact, location, or classification assertions are suppressed from normal results until reverified. Historical audit evidence may remain subject to retention rules but must not appear as current guidance.

## Data lifecycle

Acquire under approved terms → quarantine → validate → normalize → resolve identity → attach provenance and license → verify → publish → monitor freshness → correct, expire, suppress, archive, or remove.

License expiry or takedown must propagate to published records, derived search data, caches, and media delivery as required.

## Privacy and retention

Define retention classes for identity, trips, conversations, private corrections, telemetry, audit history, sources, and backups. Precise location history is not an MVP domain. Account deletion must propagate through primary state and downstream projections, subject to qualified legal review.

## Post-MVP concepts

Accommodation, public reviews, collaborative itineraries, sponsorship, partner commerce, affiliate attribution, and booking-related records are intentionally deferred.

## Physical design gate

Physical design begins only after launch destination, languages, source licenses, image rights, emergency-data feasibility, privacy review, query patterns, and the managed storage choice are approved.
