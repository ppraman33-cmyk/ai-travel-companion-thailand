# Thailand Village Baseline Architecture

## Research-only boundary

This baseline records administrative village identities observed in the DOPA/BORA July 2026 village-level snapshot. It is quarantined research evidence, not a production source. It is not imported into Supabase, application services, APIs, UI, search, sitemap, manifest, service worker, or offline cache. Database migrations 001–014, generated types, RLS, RPCs, and deployment configuration remain unchanged.

The parent relationship is `Village → Tambon → Amphoe → Province`. Bangkok is excluded because its khet/khwaeng structure does not use this provincial village contract. No Bangkok community or synthetic village is created.

## Compact normalized storage

The reviewed canonical representation contains 75,652 records. To avoid an 83.23 MB monolithic Git blob, storage schema version 2 uses 76 plain-JSON province shards. Each row contains only:

1. authoritative eight-digit village code;
2. village number;
3. official Thai name;
4. parent tambon code.

Shared source, represented-date, lifecycle, English-name, rights, boundary, publication, conflict, and research-note fields live once in the root manifest. Amphoe/province codes, parent Thai/English names, and region are deterministically joined from the quarantined ADM3 registry using `parentTambonCode`.

The research-only compatibility loader reconstructs the complete canonical records. It verifies every shard checksum and then verifies canonical SHA-256 `c6747dbc350d9e16ab21ba05535d911625a7b3ef0823c2ae0fe81a3210b7d333`. This is the same semantic record checksum as the original 75,652-record review representation; no record or required contract field is removed.

All shards are below 10 MB. Checked-out shard data totals about 3.83 MB. The format is inspectable text JSON; Git LFS, ZIP, gzip, and opaque binary containers are not used.

## Identity and lifecycle

The code—not the village number—is the nationwide identifier. Village-number uniqueness is enforced within the parent tambon. English village names are absent from the official monthly evidence, so every reconstructed record has an empty `nameEn` and `englishNameStatus: pending`. No transliteration, AI output, or guessed translation is stored.

The monthly source lacks an explicit lifecycle field. July identities are only `observed_current_snapshot`. The single March code absent from July remains `unresolved_not_inferred_as_inactive_or_cancelled`; it is not classified as inactive or cancelled.

## Privacy minimization

The downloaded statistical artifacts contain demographic values, but the builder reads only the first nine administrative columns and retains only identity fields. Validators reject population, demographic, household, house-number, gender, age, nationality, religion, person-name, phone, coordinate, and geometry fields.

No source XLS/XLSX file is committed or exposed for download.

## Commands and publication gate

```sh
npm run geography:villages:check
```

The root defaults and every reconstructed record remain rights pending, boundary pending, and publication blocked. Merging the research baseline would not approve redistribution, production import, public exposure, or geometry use.
