# Chiang Mai Restaurants Evidence Baseline — Research Contract

## Goal

Build a province-wide research registry for all 25 Chiang Mai districts, targeting up
to 10 restaurants per district (about 250 records). The target is not a quota: a
district remains below target when identity, current operation, exact district parent,
or catalog suitability cannot be independently supported.

## Selection focus

1. Northern Thai and other established local-food restaurants.
2. Long-running restaurants where longevity is supported by a dated source.
3. Community-run restaurants and food markets with a stable visitor-facing identity.
4. Street-food vendors with a stable business name and location.

Chains, cafes without a meaningful food offering, nightlife-only venues, temporary
vendors, and unnamed stalls are outside the initial baseline unless separately
approved.

## Evidence gates

Each admitted research record must separately account for:

- restaurant identity;
- evidence of current operation;
- exact Chiang Mai district parent;
- direct owner/operator identity when available;
- source represented date and retrieval date;
- factual-data rights and media rights.

Search snippets, ratings, review counts, and map pins are discovery leads only. They
are not final evidence. Google Maps names, addresses, reviews, photographs, or place
content must not be scraped, bulk copied, or persisted as ATC-owned catalog data.

## Fail-closed defaults

- `publicationEligibility`: `blocked`
- `rightsStatus`: `facts_only_rights_pending`
- `mediaRightsStatus`: `not_assessed_no_media_downloaded`
- coordinates, hours, price range, accessibility, menu details, and contact facts:
  `null` or `pending` until assertion-level evidence is approved
- no image, PDF, spreadsheet, archive, or source binary is downloaded or committed

The registry is research evidence only. It is not production content and must not be
read by runtime UI, public API, cache, database seed, or deployment code.

## Province-wide completion rule

The batch is complete only after the matrix accounts for all 25 districts. A district
may close below 10 records, including at zero, when its search log documents why the
remaining candidates did not pass. No restaurant may be borrowed from a neighboring
district to equalize coverage.

## Google Places layer

A future live “restaurants near me” experience may use the official Google Places API
with required attribution, billing controls, and storage restrictions. Google Places
results are not part of this static research registry.
