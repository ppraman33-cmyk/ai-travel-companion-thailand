# Thailand Nationwide Subdistrict Baseline Architecture

## Decision

The ADM3 registry is a **research/evidence-only quarantine artifact**. It is not a production catalog, publication source, API contract, UI data source, downloadable public dataset, seed or migration.

The baseline joins official subdistrict identities to the existing quarantined 928-district registry and approved 77-province registry. It contains no geometry, village, place, media, emergency or tourism content.

## Identity model

Each active record contains the official six-digit CCAATT identity, Thai and official English names, explicit `tambon` or `bangkok_khwaeng` classification, its four-digit district/เขต parent, its `TH-CC` province parent and approved six-region membership.

The first four digits of every ADM3 code must equal its parent district code. The first two digits must equal the numeric portion of the province code. Both relationships fail closed against the already-reviewed research district registry.

Bangkok identities remain `bangkok_khwaeng` and retain the `แขวง` Thai prefix confirmed by the March 2026 DOPA evidence. They are never silently converted to tambon. Pattaya is not introduced as a province or district.

## Evidence and lifecycle

- Active identity rows come from DOPA CCAATT represented at 2023-09-01.
- A DOPA ADM3 population workbook represented at 2026-03 independently confirms all active codes, Thai names and parent relationships.
- Disposed CCAATT rows are counted for lifecycle evidence but excluded from the active registry.
- English names are accepted only from CCAATT. No transliteration is invented.
- Boundaries remain absent and `pending`.
- Explicit reuse rights remain unresolved, so all identities remain publication blocked.

## Quarantine boundary

The full registry is stored only under `data/research`. Runtime directories (`app`, `application`, `components`, `public`, and `infrastructure`) must not reference it. It must not enter Supabase, APIs, sitemap, manifest, service worker, offline cache or production adapters.

Source workbook files are never committed or exposed for download. Only the minimum structured factual identities, source register, checksums and validation evidence are retained.

## Future gate

Any production use requires a new Founder decision after current authoritative freshness, explicit redistribution permission, provenance review and an atomic audited import design have all passed. Merging this baseline does not grant redistribution or publication rights.
