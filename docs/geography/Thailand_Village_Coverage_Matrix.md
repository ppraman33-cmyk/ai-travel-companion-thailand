# Thailand Village Coverage Matrix

| Measure | Result |
| --- | ---: |
| Current July 2026 village identities | 75,652 |
| Provincial provinces | 76 / 76 |
| Amphoe | 878 / 878 |
| Provincial tambon evaluated | 7,256 / 7,256 |
| Tambon with numbered villages | 7,111 |
| Tambon with zero numbered-village records | 145 |
| Bangkok villages | 0 |
| Explicit inactive/cancelled records | 0 |
| Unresolved March-to-July non-observation | 1 |
| Empty Thai names | 0 |
| Generic number-only Thai labels | 384 |
| Authoritative English-name gaps | 75,652 |
| Duplicate codes/numbers | 0 |
| Orphan/cross-parent records | 0 |
| March-to-July identity conflicts | 0 |

The 145 zero-count tambons are not inferred to be urban, municipal, cancelled, or exceptional. Their source-limited reason is only `no_numbered_village_record_in_2026_07_source`.

The canonical machine-readable matrix is `data/research/thailand-village-evidence.manifest.json`. It contains counts for all 76 provinces, 878 amphoe, and 7,256 tambon; the 145 zero-village parent identities; all March/July reconciliation codes; source provenance; compact-shard checksums; and normalized record defaults.

## Storage comparison

| Storage | Size | Largest file |
| --- | ---: | ---: |
| Original monolithic PR #11 representation | 87,270,467 bytes | 87,270,467 bytes |
| Compact province shards | 3,830,107 bytes | 193,588 bytes |

The compact representation reduces checked-out registry data by about 95.6% without reducing records or reconstructed fields. The canonical reconstructed record checksum is `c6747dbc350d9e16ab21ba05535d911625a7b3ef0823c2ae0fe81a3210b7d333` for 75,652 records.

All reconstructed identities remain `verified_authoritative_snapshot`, `observed_current_snapshot`, English pending, rights pending, boundary pending, and publication blocked.
