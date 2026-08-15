# Thailand District Identity — Sources and Rights

## Decision

This baseline is **research/evidence only**. It must not be imported into the production database, exposed through public APIs, rendered in traveler UI, added to offline caches, or treated as publication-ready until the Founder approves an explicit reuse-rights decision.

No district geometry, subdistrict, village, place, media, emergency record or tourism description is included.

## Primary identity source

- Dataset: DOPA CCAATT locality directory
- Publisher/owner: Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior
- Source page: https://stat.bora.dopa.go.th/stat/statnew/statMenu/newStat/ccaa.php
- HTTPS workbook: https://stat.bora.dopa.go.th/dload/ccaatt.xlsx
- Retrieved: 2026-08-15
- Represented/effective date displayed in workbook: 2023-09-01
- Evidence locator: sheet `ccaatt_25660901`; active `CCAA0000` rows; columns for administrative code, Thai name, English name and disposal date
- SHA-256: `5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9`
- Rights status: **pending explicit redistribution terms**

The public source page explains the two-digit province, district and subdistrict code structure and identifies disposed/cancelled entries. It does not present an explicit license or permission for redistribution in this project. The workbook is therefore used only to create a blocked internal evidence registry.

## Current authoritative count source

- Document: Registration offices providing services nationwide
- Publisher/owner: Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior
- HTTPS URL: https://www.bora.dopa.go.th/wp-content/uploads/2026/02/tabdb_09022569.pdf
- Retrieved: 2026-08-15
- Represented date: 2026-02-09
- Evidence locator: page 1, rows for district registration offices and Bangkok districts; regional-administration summary
- SHA-256: `a7af70988cdcfbe9c72dee224f7ac382cffc135942d6be82d8c77c834658d6d4`
- Authoritative total: **878 provincial districts and 50 Bangkok districts**
- Rights status: **pending explicit redistribution terms**

The current total reconciles exactly with the active identity rows in the official CCAATT workbook: 928 administrative-level-2 identities across all 77 province-level parents.

## Identity and transliteration handling

- District codes, Thai names and English names are copied from active official CCAATT district-level rows without invented transliteration.
- Bangkok records retain the source `เขต` prefix and use `bangkok_district`; they are not silently converted to provincial districts.
- Parent names and six-region membership come from the approved 77-province project registry and join by the official two-digit province code.
- DOPA spells the parent province English label `Phang-nga`; the approved project registry uses `Phang Nga`. Thai name and code `TH-82` agree. This formatting variance does not alter district identity.
- Pattaya is not a province and is never created as a parent province record.

## Reproduction

Download both official files to a temporary directory, verify their checksums, then run:

```sh
python3 scripts/build-thailand-district-registry.py /tmp/ccaatt.xlsx /tmp/tabdb_09022569.pdf
node scripts/validate-thailand-district-evidence.mjs
```

The generator accepts only the reviewed source checksums. It fails closed on count, parent, Unicode, uniqueness, classification, boundary or publication-gate violations.

## Future rights gate

Before any production import, obtain and record explicit reuse/redistribution terms or written permission from the data owner. The future import must be atomic, audited, server-authorized and subject to existing publication gates. Browser direct writes and client-controlled owner/admin/session identity remain prohibited.
