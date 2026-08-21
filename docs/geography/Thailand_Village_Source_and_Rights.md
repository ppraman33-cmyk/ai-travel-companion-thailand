# Thailand Village Sources and Rights

## Fresh Founder-review retrieval

All source artifacts were downloaded again from public DOPA/BORA endpoints on 2026-08-21. Retrieval dates are recorded separately from represented dates. Every row was checked against its represented period.

### Parent-chain source

- URL: `https://stat.bora.dopa.go.th/dload/ccaatt.xlsx`
- Represented: 2023-09-01
- SHA-256: `5977e39e689d229668dabb2ff47f1a1a4bec341bd1efa0792cb45cad8e16d6e9`
- Use: active provincial tambon/amphoe/province codes and parent names only

CCAATT ends at ADM3 and is not claimed as an independent village-total source.

### March 2026 village cross-check

- Catalog: `https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=03&year=69`
- Parameters: `month=03`, `year=69`
- Represented: 2026-03
- Fresh catalog SHA-256: `453326c81d62bd811ca3edcdc24d66804c62720923a6ce8db12327d8411dd459`
- Fresh 77-artifact-set SHA-256: `929fc5af4eda9fecece162eb726e3d3e970e6bb81b624b85f58330fb745e39a8`

### July 2026 current snapshot

- Catalog: `https://stat.bora.dopa.go.th/new_stat/webPage/statByMooBan.php?month=07&year=69`
- Parameters: `month=07`, `year=69`
- Represented: 2026-07
- Fresh catalog SHA-256: `54071e5c890433b73f4ca1646ad48ea26c062a14f4c8df051528fd7677868eae`
- Fresh 77-artifact-set SHA-256: `d5a1f84a37ac56575a3ed316b00248d77313e6df5bb40ed5acc07aa3166496b8`

The manifest records all 154 exact artifact names, province codes, direct-path or public form-export method, request parameters, and SHA-256 values. Several freshly downloaded files differ byte-for-byte from the first retrieval while their administrative identity columns remain semantically identical. The new checksums are retained; represented dates are not changed or inferred from retrieval time.

## Reconciliation

March has 75,647 provincial numbered-village identities and July has 75,652. July adds six codes; one March code is absent; common identities have zero Thai-name or parent conflicts. Registration-office repetitions are not treated as administrative parents.

The absent code remains an unresolved observation gap. No inactive/cancelled status is asserted without explicit lifecycle evidence.

## Rights

The downloads are publicly accessible official statistical evidence, but explicit redistribution terms for republishing the derived registry have not been established. Public accessibility is not treated as a redistribution license.

All sources and reconstructed records therefore remain `pending_explicit_redistribution_terms`; boundaries remain `pending`; publication remains `blocked`. No production import, public API/UI/cache exposure, or source-binary redistribution is authorized.
