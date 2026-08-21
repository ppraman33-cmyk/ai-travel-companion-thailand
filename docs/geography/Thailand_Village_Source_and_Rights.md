# Thailand Village Sources and Rights

## Source register

### Parent-chain authority

- Publisher/owner: Bureau of Registration Administration, Department of Provincial Administration, Ministry of Interior
- Artifact: `https://stat.bora.dopa.go.th/dload/ccaatt.xlsx`
- Represented date: 2023-09-01
- Retrieved: 2026-08-21
- SHA-256: `5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9`
- Use in this baseline: authoritative active tambon/amphoe/province code and Thai/English parent names only

CCAATT does not contain village rows and is not presented as an independent village-total source.

### March 2026 village identity cross-check

- Catalog: `https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=03&year=69`
- Query: `month=03`, `year=69`
- Represented month: 2026-03 (B.E. 2569 month 03)
- Retrieved: 2026-08-21
- Catalog SHA-256: `f010f0dd765c113c3324747b04dbd3eec786638b46d53769fbd6c530cba849ea`
- Artifact-set SHA-256: `527120451009c18732c3f187a5dc0b1a94fdc4c60b25051ac7f155e6d53c066f`
- Evidence: 77 province artifacts, with direct URLs or the catalog's public `exportfile3.php` form and exact `filemoo_send` parameter

### July 2026 current village identity snapshot

- Catalog: `https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=07&year=69`
- Query: `month=07`, `year=69`
- Represented month: 2026-07 (B.E. 2569 month 07)
- Retrieved: 2026-08-21
- Catalog SHA-256: `54071e5c890433b73f4ca1646ad48ea26c062a14f4c8df051528fd7677868eae`
- Artifact-set SHA-256: `1818ba3de7a0f2a7a0fe3e17dfbe43a095c8227a7aaff130e61b68bb57029194`
- Evidence: 77 province artifacts, with direct URLs or the catalog's public `exportfile3.php` form and exact `filemoo_send` parameter

The manifest records every artifact name, province code, retrieval method, exact URL/request parameter, and SHA-256. Retrieval dates are not treated as represented dates.

## Reconciliation result

March contains 75,647 provincial numbered-village codes; July contains 75,652. Six codes are newly observed in July, one March code is not observed in July, and the identities common to both months have no Thai-name or administrative-parent conflict. Registration-office observations are deliberately not used as the administrative parent because one village can be repeated under multiple registration offices.

The missing March code is kept only in the manifest reconciliation log with status `unresolved_not_inferred_as_inactive_or_cancelled`. No lifecycle conclusion is invented.

## Rights assessment

The artifacts are publicly accessible official-government statistical downloads, but no explicit redistribution terms for republishing the derived nationwide identity registry were established during this batch. Public accessibility is not treated as a redistribution license.

Therefore:

- source and record rights remain `pending_explicit_redistribution_terms`;
- publication eligibility remains `blocked`;
- no source binary is committed or offered for download;
- no production import, API/UI/cache exposure, or downstream data activation is authorized.

Future publication requires a recorded owner/authority decision and explicit usage-right verification. Boundary geometry, if ever considered, requires a separate source and rights review.
