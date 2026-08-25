# Chiang Mai Attractions Source Register

Status: `research_evidence_only`

Publication: `blocked`

Latest Batch 4 retrieval: 2026-08-25

The machine-readable source register is
`data/research/chiang-mai-attractions-sources.json`. It contains 28 direct-owner
or official-government sources across the four evidence batches. No Google
Maps, Facebook page, blog, aggregator, or search snippet is used as final
evidence.

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

## Batch 3 official-source decisions

Five additional identities passed the direct identity-plus-parent gate:

- Huai Hong Khrai Royal Development Study Centre — Chiang Mai Provincial Office
- Doi Bo Luang Forest Plantation — Forest Industry Organization
- Khu Pa Dom archaeological monument — Fine Arts Department
- San Kamphaeng Hot Springs under the Royal Initiative — Chiang Mai Provincial Office, explicitly in Mae On
- Ban Wat Chan Forest Plantation — Forest Industry Organization

Undated pages retain `representedAt: null`; retrieval on 2026-08-22 is recorded
separately and is not treated as freshness. The broad Wiang Kum Kam locality,
Ob Luang park area, Mae Kampong, Bo Sang, Pha Daeng and Ob Khan remain excluded
from the relevant gap districts.

Founder review supplements the Mae On hot-spring record with provincial news
13436, recorded 2025-06-13. It is the current identity and district-parent
assertion; the 2023 page is retained as historical corroboration only.

## Batch 4 official-source decisions

Five candidates passed the identity, responsible-authority and district gate:

- Roi Jai Rak Garden — direct Mae Fah Luang Foundation project evidence plus an
  official Mae Ai district tourism listing
- MAIIAM Contemporary Art Museum — direct museum-owner visitor page
- Thai Agricultural Culture Museum — Maejo University Archives plus the
  university's official San Sai campus address
- Doi Wiang Pha public-service unit — DNP's district-specific visitor-assistance
  register; the wider multi-district park is not assigned to Chai Prakan
- Chiang Mai Royal Agricultural Research Centre (Khun Wang) — Department of
  Agriculture tourism and district-specific centre pages

Undated sources retain `representedAt: null`; retrieval on 2026-08-25 is not
used as a represented date. Mae Chaem remains a gap because the reviewed
municipal material did not expose a stable site identity and authority without
requiring an uncommitted source binary. Wiang Haeng remains a gap because Doi
Dam is explicitly on the Wiang Haeng–Pai boundary and no district-specific
visitor point was established. No source image, PDF, spreadsheet or other
binary was downloaded into or committed to the repository.
