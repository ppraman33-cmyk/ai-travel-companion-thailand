# Thailand Province Map — Source and Rights

## Approved geometry source

- Dataset: geoBoundaries gbOpen Thailand ADM1
- Publisher: William & Mary geoLab / geoBoundaries
- Underlying owner/contributors: OpenStreetMap contributors; extraction credited by the publisher to Wambacher
- Metadata URL: https://www.geoboundaries.org/api/current/gbOpen/THA/ADM1/
- Pinned geometry URL: https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/THA/ADM1/geoBoundaries-THA-ADM1.geojson
- Pinned revision: `9469f09`
- Retrieved: 2026-08-14
- Represented year: 2017
- CRS: WGS84 / OGC:CRS84, longitude then latitude
- License: Open Data Commons Open Database License 1.0 (ODbL-1.0)
- License URL: https://opendatacommons.org/licenses/odbl/1-0/
- Required attribution: © OpenStreetMap contributors; boundary data via geoBoundaries (William & Mary geoLab), ODbL 1.0

The ODbL permits product and commercial use subject to attribution and its database/share-alike conditions. The map displays attribution in the UI. Legal review is still required before distributing a modified database independently from the application.

## Registry mapping

The source provides 77 ADM1 features and ISO-style subdivision identifiers. Generation maps those identifiers to the project's quarantined 77-province identity registry. The registry contributes names, slugs and the existing six-region application taxonomy; it does not activate destinations or publish place facts.

Bangkok (`TH-10`) is included exactly once. Pattaya is not a province record. Real province names and boundaries are licensed geographic context only. All province content routes remain evidence-pending unless the existing publication gates independently authorize content.

## Rejected source classes

- OCHA/RTSD and humanitarian-restricted mirrors: not used.
- geoBoundaries `gbAuthoritative`: not used because its API documentation says it cannot be used commercially.
- Reference screenshots and AI-drawn boundaries: never used as geographic sources.
- External tiles and imagery: not used.

## Reproducibility

Download the pinned source to a temporary path and run:

```sh
node scripts/build-thailand-province-map.mjs /path/to/geoBoundaries-THA-ADM1.geojson
```

The generator fails closed unless all 77 mappings and geometry invariants pass. Source and normalized checksums are recorded in `data/geography/thailand-provinces.manifest.json`.
