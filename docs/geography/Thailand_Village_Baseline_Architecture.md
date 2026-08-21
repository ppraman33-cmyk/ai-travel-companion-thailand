# Thailand Village Baseline Architecture

## Purpose and boundary

This baseline is a quarantined administrative-identity research artifact. It records the numbered villages observed in the Bureau of Registration Administration (BORA), Department of Provincial Administration (DOPA) July 2026 village-level statistical snapshot and connects them to the previously reviewed provincial tambon, amphoe, and province registries.

It is not a production content source. It is not imported into Supabase, application services, APIs, UI, search, sitemap, manifest, service worker, or offline cache. Migrations 001–014, generated database types, RLS, RPCs, and deployment configuration are unchanged.

The parent contract is:

`Village → Tambon → Amphoe → Province`

Bangkok is explicitly outside this contract. Its 50 khet and 180 khwaeng remain represented only by the ADM2/ADM3 research baselines; no Bangkok village, community, or synthetic substitute is created.

## Identity model

Each current record contains the DOPA eight-digit village code, the village number encoded in its last two digits, the Thai name observed in the July snapshot, and the complete approved parent chain. The code—not the village number—is the nationwide identifier. Village-number uniqueness is enforced within the parent tambon.

The monthly files do not provide authoritative English village names. `nameEn` is therefore empty and `englishNameStatus` is `pending` for all 75,652 records. No transliteration, translation, AI output, or inferred name is stored.

The monthly files also do not provide an explicit lifecycle field. A July record is classified only as `observed_current_snapshot`. The one March code not observed in July remains an unresolved reconciliation gap; it is not called inactive or cancelled without explicit evidence.

## Privacy minimization

The official source artifacts contain population-by-age and sex columns. The builder reads only the first nine administrative columns and emits only identity fields. The registry and validator prohibit population, demographic, household, house-number, gender, age, nationality, religion, person-name, phone, coordinate, and geometry fields.

No source XLS/XLSX artifact is committed. Only checksums, artifact locators, request parameters, and derived administrative identities are retained.

## Deterministic build and validation

The builder accepts five external inputs: CCAATT, the March artifact directory, the July artifact directory, and the two monthly catalog pages. It checksum-pins all inputs, requires all 77 province artifacts in each monthly set, validates each row's represented period and province, discards Bangkok and non-numbered `00` rows, and joins each village to an existing provincial tambon.

Run the checked-in contract validator with:

```sh
npm run geography:villages:check
```

The validator fails closed on count drift, duplicate codes or numbers, unknown/crossed parents, Bangkok records, guessed English, unsupported lifecycle claims, prohibited privacy fields, rights/boundary/publication relaxation, incomplete provenance, runtime leakage, and committed source binaries.

## Publication gate

The root and every record remain:

- `status: research_evidence_only`
- `rightsStatus: pending_explicit_redistribution_terms`
- `boundaryStatus: pending`
- `publicationEligibility: blocked`

Merging this baseline would preserve research evidence only. It would not approve redistribution, production import, public exposure, or geographic boundary use.
