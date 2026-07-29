# Authorized Data-Source Feasibility

## Rule

Public accessibility is not permission to copy. Every selected dataset, document, feed, business submission, or open-data source requires a recorded license and operational review. No MVP data may be copied from Google Maps, Facebook, general web search, unauthorized directories, or scraped websites.

Thailand’s Data.go.th guidance expects machine-readable open datasets to carry an open license, but the license must still be checked on each dataset ([guidance](https://data.go.th/pages/about-open-data), [DGA Open Government License terms](https://data.go.th/uploads/page_images/2021-06-11-053225.908526Terms-and-Conditions-for-DGA-Open-Government-LicenseEN04062021.pdf)).

## Candidate source matrix

The entries below describe feasible **categories**, not blanket authorization.

| Domain / source owner | Type and expected basis | Storage / modification / redistribution | Attribution / caching / commercial use | Automation, freshness, verification, exit |
|---|---|---|---|---|
| Attractions — TAT, DGA, provincial/local authorities, venue owners | Government open dataset with explicit license; written venue permission | Only as stated by dataset or agreement; normalize facts without copying protected editorial expression unless allowed | Record exact attribution; commercial use and caching only if terms permit | Manual/light import initially; quarterly ordinary review, shorter for volatile fields; disable affected assertions and replace source on revocation |
| Restaurants — business owners, local associations, first-party fieldwork | Signed business submission or founder-observed facts with documented method | Store submitted facts and permitted text/media; modifications defined in agreement | Attribution optional only if agreement says so; commercial reuse must be explicit | Manual onboarding; hours/contact checked every 60–90 days; suppress unverified volatile fields if permission withdrawn |
| Food specialties — cultural authorities, qualified experts, first-party editorial research | Commissioned/original summary grounded in authorized references | Store original editorial text; source facts and quotations separately | Attribute required sources; avoid copying recipe/editorial expression | Human curated; annual review or when claims disputed; rewrite/remove if source rights change |
| Events — official organizer, local authority, TAT open dataset | Direct organizer permission or explicitly licensed government data | Store dates/status/location under terms; do not assume poster/image rights | Attribute organizer/source; cache only through event validity | Daily/weekly checks near occurrence; manual MVP import; cancel/suppress occurrence on revocation |
| Markets/walking streets — municipality, organizer, first-party verification | Official schedule with explicit reuse permission or direct written confirmation | Store recurring pattern and exceptions; editorial descriptions must be original/authorized | Source attribution and last-check display | Check monthly and before major holidays; retain history but expire current occurrence |
| Emergency facilities — Ministry/public health bodies, official facility, police/fire/tourist-police authority | Authoritative register/feed or documented direct verification | Store only approved facts; modifications limited to normalization/translation with review | Always retain authority and verification date; no commercial ranking | Manual verified seed; 30-day critical-field checks; immediately suppress disputed critical data |
| National emergency numbers — official government and service agencies | Official publication; confirm current number with responsible agency | Store and translate structured labels; do not alter numbers | Cite issuing authority and last check | Check monthly and after official notices; disable call action if unresolved conflict |
| Geographic boundaries — DGA/local authority open data; OSM where compatible | Open Government License or ODbL | Storage and derived use subject to exact license; ODbL may impose attribution/share-alike obligations | OSM requires attribution; commercial use possible under ODbL; public Nominatim has usage limits | Prefer one-time approved import, not public API dependence; preserve provider reference; replace dataset on exit |
| Addresses/coordinates — official source, direct business submission, first-party verification, compatible OSM data | License or direct authorization | Store normalized fields only when allowed | Show attribution where required; do not derive by copying Google Maps | Manual/batch validation; recheck disputed coordinates; map handoff uses internal verified coordinates |
| Opening hours/contact details — entity owner or responsible authority | Direct submission/confirmation or licensed feed | Store values and assertion history | Source may be internally recorded even if not publicly attributed; terms govern reuse | Review 60–90 days for ordinary businesses, shorter for emergency records and near events |
| Weather — licensed weather API | Provider contract and underlying data licenses | Cache only within terms; modifications and redistribution limited by license | Attribution normally required; commercial API plan may be needed | Cache by forecast volatility; provider adapter; disable weather feature rather than show stale forecast |
| Translation — human contractor under work agreement; approved translation provider | Assignment/license for human work or provider terms | Store reviewed fixed translations; dynamic provider output retained minimally | Follow provider attribution and retention terms | Human review safety text; provider-neutral interface; remove/retranslate stored content if rights require |

## OpenStreetMap caution

OpenStreetMap data is under ODbL with attribution and share-alike considerations ([OSM legal guidance](https://wiki.openstreetmap.org/wiki/License/Use_Cases)). The public Nominatim service limits heavy use and requires identification and attribution ([usage policy](https://operations.osmfoundation.org/policies/nominatim/)). Use OSM only after a dataset/license design review; do not make the public service an unbounded production dependency.

## Feasible MVP acquisition plan

1. Seed government or local-authority data only where the specific license permits the intended use.
2. Verify and enrich a bounded catalog through direct business/venue contact and first-party fieldwork.
3. Write original descriptions instead of copying provider prose.
4. Maintain assertion-level evidence for volatile facts.
5. Use manual or lightly assisted import; postpone large automated feeds.
6. Activate no record until authorization, provenance, verification, and license gates pass.

## Exit strategy template

For every source, record:

- Contract/license termination trigger and notice period
- Records, assertions, images, translations, and derivatives affected
- Replacement source
- Public, cache, search, storage, and backup cleanup obligations
- Attribution removal or preservation
- Deadline, owner, evidence, and user-impact plan

## Blocking uncertainties

- Exact reuse rights of candidate TAT and local datasets
- Availability of a lawful facility directory with adequate contact/location freshness
- Business willingness to grant durable fact and image permissions
- Whether ODbL obligations fit the intended database publication
- Weather commercial license and caching terms
- Legal interpretation of database, copyright, and commercial-use obligations

Qualified legal review is required before treating any source category as approved.
