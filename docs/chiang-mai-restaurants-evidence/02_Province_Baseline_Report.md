# Chiang Mai Restaurants Evidence Baseline — Province Report

## Decision

The initial research import covers all 25 Chiang Mai districts with 175 quarantined
restaurant records. The target of 10 records per district is a ceiling, not a quota.
Every district retains the number supported by the current discovery pass, ranging
from 2 to 10 records.

This is a candidate and evidence baseline, not publication-ready restaurant content.
No record is connected to runtime, API, cache, database seed, or UI.

## Coverage

| District code | District       | Records |
| ------------- | -------------- | ------: |
| 5001          | เมืองเชียงใหม่ |      10 |
| 5002          | จอมทอง         |       9 |
| 5003          | แม่แจ่ม        |       7 |
| 5004          | เชียงดาว       |       9 |
| 5005          | ดอยสะเก็ด      |       9 |
| 5006          | แม่แตง         |      10 |
| 5007          | แม่ริม         |       9 |
| 5008          | สะเมิง         |       4 |
| 5009          | ฝาง            |       9 |
| 5010          | แม่อาย         |       9 |
| 5011          | พร้าว          |      10 |
| 5012          | สันป่าตอง      |       5 |
| 5013          | สันกำแพง       |       9 |
| 5014          | สันทราย        |       9 |
| 5015          | หางดง          |      10 |
| 5016          | ฮอด            |       3 |
| 5017          | ดอยเต่า        |       4 |
| 5018          | อมก๋อย         |       9 |
| 5019          | สารภี          |      10 |
| 5020          | เวียงแหง       |       1 |
| 5021          | ไชยปราการ      |       3 |
| 5022          | แม่วาง         |       3 |
| 5023          | แม่ออน         |      10 |
| 5024          | ดอยหล่อ        |       2 |
| 5025          | กัลยาณิวัฒนา   |       2 |

## Evidence composition

- Total research records: 175
- Districts represented: 25/25
- Official local-government or government-health listings: 9 records
- OpenStreetMap candidate records: 166
- Registered sources: 174
- Duplicate normalized name within a district: 0
- Cross-district borrowed records: 0

OpenStreetMap candidates were selected from named restaurant, food-court, and
fast-food elements located inside each district's administrative boundary. Explicitly
generic names, chains, non-restaurant identities, semantic duplicates, and clearly
foreign-cuisine candidates were removed. Coordinates were
used only for boundary classification and are not retained in the registry.

OpenStreetMap data is attributed to OpenStreetMap contributors and is available under
the [Open Data Commons Open Database License](https://www.openstreetmap.org/copyright).
Publication remains blocked until the project's ODbL attribution and derivative-
database obligations receive a separate compliance review.

## Deferred facts

The following are intentionally `null` or `pending` for every record:

- daily opening and closing hours;
- holidays and temporary closures;
- price range;
- menu and signature dishes;
- telephone and other contact details;
- coordinates and map links;
- accessibility;
- photographs and media rights.

The existence of an OpenStreetMap element is not treated as proof that the business
is currently operating. Direct owner or operator re-verification remains required
before any record can move toward publication.

## Known limitations

- The baseline favors coverage and candidate discovery, not restaurant ranking.
- OpenStreetMap coverage varies materially by district.
- Nine official/local records may still be stale; their visitor facts were not
  imported.
- The two Galyani Vadhana health-establishment pages describe the correct current
  district but retain a legacy structured-address header saying Mae Chaem. Those two
  records remain quarantined for parent-metadata resolution.
- No review score, review text, Google Maps content, search snippet, or photograph was
  imported.

## Promotion gates

A record may move beyond this research baseline only after independent review of:

1. current operation;
2. exact business identity and district;
3. owner/operator source;
4. category fit with local, community, long-running, or street-food focus;
5. factual-data rights and required attribution;
6. media rights, if media is added later.
