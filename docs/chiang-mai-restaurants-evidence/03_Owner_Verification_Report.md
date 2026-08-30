# Chiang Mai Restaurant Owner Verification — Research Closure

## Decision

The 175-record Chiang Mai restaurant baseline was reconciled across all 25 districts
under a fail-closed current-operation contract. Three records have enough direct and
independent evidence to advance to `verified_research_record`. The other 172 remain
quarantined as `pending_more_evidence`.

This is a research verification result, not a statement that Chiang Mai restaurant
content is complete or publication-ready. No record is eligible for production import.

## Admitted research records

- **Mueang Chiang Mai (5001) — Huen Muan Jai / เฮือนม่วนใจ๋**
  - A dated restaurant-controlled social post supports identity, current operation
    and owner/operator control.
  - The current Michelin Guide entry independently supports restaurant identity and
    the Mueang Chiang Mai parent.
  - Opening hours, prices, menu, contact details, coordinates, accessibility and media
    remain intentionally unimported.
- **San Kamphaeng (5013) — Meena Rice Based Cuisine / มีนา มีข้าว**
  - The restaurant-controlled social page supports current restaurant activity.
  - The current Tourism Authority of Thailand restaurant listing independently
    supports identity and the San Kamphaeng parent.
- **Saraphi (5019) — Ginger Farm Chiangmai**
  - A dated owner-controlled post supports current operation.
  - The operator-controlled location page supports the Saraphi parent and confirms
    the visitor-facing restaurant service.

## Pending records

- 163 remaining OpenStreetMap candidates: OSM supports discovery identity and spatial
  placement, but cannot by itself establish current operation or owner/operator
  control.
- 7 official or municipal listings: identity and historical district evidence are
  useful, but represented dates are old or absent and do not establish current
  operation today.
- 2 Ban Chan records: identity evidence exists, but the legacy district header
  conflict and missing direct current-operator evidence keep both records pending.

## Coverage

- Districts reviewed: 25/25
- Baseline records reviewed: 175/175
- Verified research records: 3
- Pending more evidence: 172
- Excluded in this round: 0
- Publication eligibility: blocked for all records
- Production import eligibility: blocked for all records

## Rights and visitor facts

- Factual-data rights remain `facts_only_rights_pending`.
- Media rights remain `not_assessed_no_media_downloaded`.
- No images, PDFs, spreadsheets, archives or source binaries were downloaded.
- Opening hours, temporary closures, prices, menus, contacts, coordinates and
  accessibility remain deferred.
- No Google Maps reviews, ratings, photographs or place content were imported.

## Revalidation triggers

A pending record may be reviewed again only when at least one of these becomes
available:

1. a new direct owner/operator source;
2. new dated evidence of current operation;
3. new exact district-parent evidence; or
4. an approved rights and freshness review.

Demand for a fixed restaurant count is not a revalidation trigger.

## Scope assurance

This batch does not change the database, migrations, schema, RLS, API, runtime UI,
cache, generated types or deployment configuration. It does not deploy, publish or
import records into production.
