# M3 Evidence Workflow and Founder Gates

## Intake boundary

Real facts are represented in the repository as an evidence registry, not production rows. A future import must pass through the authenticated Admin boundary and an audited database RPC. Direct table writes, service-role scripts, and automatic seed configuration are prohibited.

Each import request is limited to one official district code and one idempotent batch key. The whole district batch succeeds or rolls back. Failure in one district cannot commit a partial district batch and cannot roll back a previously completed district. Replaying the same key must return the prior result rather than create duplicates.

The application-level `DistrictEvidenceImportService` enforces Founder authority, district-code format, real-data classification, `evidence-pending` status, HTTPS evidence URLs, bounded batch size, canonical keys, and a server correlation ID. It intentionally has no production adapter in M3, because the current evidence register does not yet meet the database source-rights gate.

## Publication isolation

- No M3 registry is imported by application routes or public catalog repositories.
- No traveler component, public API response, search index, SEO metadata, sitemap, service worker, or offline cache imports the registry.
- Synthetic fixtures remain in `tests/fixtures/synthetic`; M3 facts are not test display content.
- The nationwide draft fixture remains quarantined and is not an M3 import path.
- Maps remain external Google Maps/Apple Maps handoff only.

## Founder-only gates

The Founder must approve emergency evidence, media rights, source rights, conflicts, and any eventual publication transition. Emergency drafts need an authoritative source, verified contact, second verification, future freshness boundary, suppression behavior, and database eligibility. Emergency content can never be sponsored.

## Category and freshness policy

Attractions, food, markets, activities, transport points, and producers require primary assertions and a verified district relationship. Restaurants additionally need a first-party source and opening-hours freshness. Events must separate the enduring event identity from dated occurrences and expire stale occurrences. Border-adjacent records need explicit district evidence or remain blocked.

## Current decision

The dataset deliberately stops at administrative Level 1. Category inventories contain zero approved records, all 25 districts have documented gaps, all media rights are pending, and no emergency service is represented. This is a safe evidence baseline, not a claim of traveler coverage.
