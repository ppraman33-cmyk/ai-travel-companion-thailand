# Thailand District Baseline Architecture

## Scope boundary

The nationwide district baseline is a quarantined evidence artifact, not an application catalog. It contains administrative identity and parent relationships only.

```text
Temporary official source files
        │ checksum + structural validation
        ▼
Research-only district evidence JSON
        │ deterministic offline validation
        ├── Coverage matrix and provenance manifest
        └── No runtime import path
```

## Current contract

Each record carries:

- four-digit authoritative district code (`CCAA`)
- authoritative Thai and English names
- `district` or `bangkok_district` classification
- approved parent province identity and six-region taxonomy
- source reference and identity-verification state
- evidence/right status
- boundary status
- publication eligibility
- notes and conflict slots

All 928 records have `boundaryStatus: pending` and `publicationEligibility: blocked`. Rights remain pending, so the file is stored under `data/research`, not in production seed or runtime infrastructure.

## Leakage boundary

The evidence registry must not be referenced by:

- `app/`, public routes or route handlers
- traveler or Admin components
- application/runtime services
- sitemap, web manifest or service-worker/offline cache
- Supabase configuration, migrations, seeds, RPCs or generated types

Repository validation scans these runtime surfaces for the evidence artifact identifier. District pages, autocomplete, public search and map boundaries are intentionally absent.

## Future import contract

No database adapter is implemented in this batch. A future proposal may proceed only after source-rights approval and must:

1. Revalidate every identity against the approved parent registry.
2. Resolve or explicitly preserve every English-name gap and conflict.
3. Keep geometry separately provenance-bound; never infer or AI-generate boundaries.
4. Use a server-only, atomic and audited import command.
5. Preserve RLS, CSRF/origin validation and publication gates.
6. Fail closed if any parent, evidence, rights or boundary contract is incomplete.

Subdistricts, villages, places, media, emergency data and tourism content require separate Founder-approved phases.
