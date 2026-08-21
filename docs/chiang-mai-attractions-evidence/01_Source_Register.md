# Chiang Mai Attractions Source Register

Status: `research_evidence_only`

Publication: `blocked`

Retrieved: 2026-08-21

The machine-readable source register is
`data/research/chiang-mai-attractions-sources.json`. It contains fourteen
official sources: five Chiang Mai Provincial Office sources, five Tourism
Authority of Thailand sources, two Department of National Parks sources, and
two Fine Arts Department sources. No Google Maps, Facebook page, blog, aggregator, or search
snippet is used as final evidence.

## Reliability and use

- Tier 3 provincial sources support named attraction-to-district or
  attraction-to-subdistrict assertions where the cited locator says so.
- Tier 4 TAT sources support attraction identity and official English labels.
- Administrative codes and parent relationships are validated against the
  committed DOPA-derived ADM2/ADM3 research registries.
- Search results were discovery aids only. Each retained assertion points to
  the official source URL, publisher, retrieval date, represented date (when
  the source supplies one), and a human-reviewable locator.

Public availability does not grant database or media redistribution rights.
Every source remains `facts_only_rights_pending`, and no image or source binary
is included.

## Freshness limitation

Undated pages are not assigned invented represented dates. Older project
documents support historical identity/parent assertions only; they do not prove
current opening hours, fees, access, safety, accessibility, or operating status.
Those fields remain pending and require a fresh authority review before any
future publication decision.

## Doi Inthanon district remediation

The Doi Inthanon record no longer uses the broad TAT itinerary as its decisive
district-parent assertion. The direct TAT attraction page identifies Chom Thong,
Chiang Mai, and has no verified represented date, so its `representedAt` remains
`null`. Chiang Mai Provincial Office news record 14279 independently identifies
the park headquarters in Chom Thong and displays a recorded date of 2026-01-15.
That date is attached only to the provincial assertion; it is not treated as a
current visitor-hours, admission, accessibility, or operating-status claim.

## Batch 2 official-source decisions

Two coverage gaps gained direct, unambiguous official parent evidence: Khun
Khan National Park (DNP/Samoeng) and Wiang Tha Kan (Fine Arts Department/San
Pa Tong). Khun Khan's DNP article is dated 2025-03-05, while the Wiang Tha Kan
page exposes no represented date. The DNP source for Ob Luang describes a park
spanning Chom Thong, Hot, and Mae Chaem, so it cannot establish a singular Hot
attraction parent. The Fine Arts source describes Wiang Kum Kam as an
archaeological locality in Tha Wang Tan, not one visitor-attraction identity;
individual monuments remain excluded pending border-sensitive parent evidence.
