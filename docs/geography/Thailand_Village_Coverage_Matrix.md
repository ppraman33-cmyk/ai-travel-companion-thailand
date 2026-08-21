# Thailand Village Coverage Matrix

## Nationwide summary

| Measure                                         | Research result |
| ----------------------------------------------- | --------------: |
| Current numbered village identities (July 2026) |          75,652 |
| Provincial provinces covered                    |         76 / 76 |
| Provincial amphoe covered                       |       878 / 878 |
| Provincial tambon evaluated                     |   7,256 / 7,256 |
| Tambon with one or more numbered villages       |           7,111 |
| Tambon with zero numbered-village records       |             145 |
| Bangkok villages                                |               0 |
| Explicitly inactive/cancelled records           |               0 |
| Unresolved March-to-July disappearance          |               1 |
| Thai names absent                               |               0 |
| Generic number-only Thai labels                 |             384 |
| Authoritative English-name gaps                 |          75,652 |
| Duplicate codes                                 |               0 |
| Duplicate village numbers within a tambon       |               0 |
| Orphan/cross-province parents                   |               0 |
| Monthly identity conflicts                      |               0 |

The 145 zero-count tambons are not guessed to be urban, municipal, abolished, or exceptional. Their evidence-backed reason is only `no_numbered_village_record_in_2026_07_source`. The manifest identifies each tambon and its parent chain.

## Machine-readable matrices

`data/research/thailand-village-evidence.manifest.json` is the canonical detailed coverage matrix and contains:

- counts for all 76 provincial provinces;
- counts for all 878 amphoe;
- counts, including zero, for all 7,256 provincial tambon;
- the complete 145-entry zero-village tambon list and source-limited reason;
- 384 generic number-only Thai identity labels;
- all March/July additions, non-observations, and conflicts;
- 77 artifact checksums and locators for each monthly snapshot.

## Status matrix

| Dimension    | All current records                     |
| ------------ | --------------------------------------- |
| Identity     | `verified_authoritative_snapshot`       |
| Lifecycle    | `observed_current_snapshot`             |
| English name | `pending`                               |
| Rights       | `pending_explicit_redistribution_terms` |
| Boundary     | `pending`                               |
| Publication  | `blocked`                               |

“Verified authoritative snapshot” means only that the identity is reproduced from the checksum-pinned official July artifact and its parent exists in the quarantined parent registry. It does not mean production-ready, redistribution-approved, or boundary-verified.

## Scope exclusions

The coverage matrix contains no Bangkok communities, municipal communities, housing estates, informal locality names, population/demographic values, household values, personal data, geometry, places, media, emergency services, or Service Car records.
