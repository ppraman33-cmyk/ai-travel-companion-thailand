# Thailand Subdistrict Identity — Sources and Rights

## Publication decision

This baseline is **research/evidence only**. Every record is publication blocked. It must not be imported into the production database, exposed through an API or traveler UI, placed in public/offline assets, or represented as licensed for redistribution.

## Primary identity source

- Dataset: DOPA CCAATT locality directory
- Publisher/owner: Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior
- Source page: https://stat.bora.dopa.go.th/stat/statnew/statMenu/newStat/ccaa.php
- File URL: https://stat.bora.dopa.go.th/dload/ccaatt.xlsx
- Retrieved: 2026-08-20
- Represented date: 2023-09-01
- Locator: sheet `ccaatt_25660901`, active `CCAATT00` rows; code, Thai name, English name and disposal date
- SHA-256: `5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9`
- Rights: **pending explicit redistribution terms**

The source page documents the two-digit province, district, subdistrict and village code segments and identifies cancelled entries. No explicit redistribution license was found. The workbook is used only as evidence for a blocked internal research registry.

## Freshness cross-check

- Dataset: DOPA monthly population statistics, ADM3 level
- Publisher/owner: Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior
- Exact catalog query: https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=03&year=69
- File URL: https://stat.bora.dopa.go.th/new_stat/file/69/3_6903.xls
- Retrieved: 2026-08-20
- Represented month: 2026-03
- Artifact parameters: Buddhist-year suffix `69`, administrative level `3`, year-month `6903`
- Locator: artifact `/69/3_6903.xls`; every data row has year-month field `6903`; columns for province code, registration-office code, subdistrict code and Thai name
- SHA-256: `cc8902fd622cf4733b244942849854e549b07f66d72e352579dcca3aeeb443d4`
- Rights: **pending explicit redistribution terms**

The URL path and every artifact row bind this evidence to March 2026 (`6903`), independently of the retrieval date. Registration-office codes can include municipal offices and are not treated as administrative parents; ADM3 parentage is derived from the authoritative CCAATT code. Only the unique ADM3 identity columns are used for a checksum-pinned cross-check. Population and demographic values are not retained. The cross-check confirms all 7,436 active identities and their 928 parent relationships but does not resolve redistribution rights.

## Reconciled result

- Provincial tambon: **7,256**
- Bangkok khwaeng: **180**
- Total ADM3 identities: **7,436**
- Province coverage: **77/77**
- Parent district/เขต coverage: **928/928**
- Missing, extra, duplicate, orphan and conflicting active identities: **0**
- English-name gaps: **0**

CCAATT omits the administrative prefix in ADM3 identity names. The 2026-03 file explicitly uses `ตำบล` and `แขวง`; the registry retains `แขวง` for Bangkok classification and canonical CCAATT names for provincial tambon.

## Reproduction and rights gate

Download both public files to a temporary directory, verify their checksums, then run:

```sh
python3 scripts/build-thailand-subdistrict-registry.py /tmp/ccaatt.xlsx /tmp/3_6903.xls
node scripts/validate-thailand-subdistrict-evidence.mjs
```

Before any production import, obtain and record explicit reuse/redistribution terms or written permission from the owner and acquire a current identity snapshot. A future import must be separately reviewed, audited, server-authorized and publication gated.
