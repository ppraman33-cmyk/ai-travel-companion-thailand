# Initial Language Strategy

## Options evaluated

| Option | Traveler value | Safety quality | Cost and workload | Search behavior | MVP suitability |
|---|---|---|---|---|---|
| English and Thai | Strong traveler/local bridge; preserves official terminology | Two reviewed safety versions | Moderate | Handles Thai script, English names, and transliteration | Recommended |
| English only with Thai place names | Lowest workload | English safety review only | Low | Weak Thai administrative and business workflows | Acceptable emergency fallback, not preferred |
| English, Thai, plus one additional language | Broader reach | Requires a third validated safety corpus | High | Adds aliases, typography, QA, and support | Post-MVP |

## Recommendation

Launch with:

1. **English traveler interface and AI responses**
2. **Thai canonical names, addresses, source material, and founder/editor content**
3. **Reviewed Thai versions of core fixed content and emergency labels**

This is an **English-and-Thai product scope**, not a promise that every long editorial paragraph is manually authored in both languages on day one. Consequential fields—names, addresses, service types, emergency instructions, dates, and contact details—must have controlled bilingual presentation.

The founder must approve this scope before implementation. If fluent Thai review cannot be secured, reduce the MVP to English interface text with Thai canonical entity fields rather than shipping unreviewed Thai safety content.

## Why not a third language initially

- Every added language multiplies emergency and safety review.
- Event and opening-hour changes create translation churn.
- Thai place-name aliases and transliteration already require substantial search work.
- Dynamic translation introduces usage cost and inconsistent terminology.
- A solo founder needs evidence of traveler demand before maintaining another interface.

## Search and transliteration requirements

- Preserve Thai canonical script; never replace it with transliteration.
- Store multiple approved English aliases without declaring one transliteration universally correct.
- Normalize spacing, punctuation, common abbreviations, and district/province qualifiers.
- Search should accept Thai, English, and known romanized variants.
- Disambiguate identical or similar names using category and geography.
- Map handoff should prefer coordinates plus Thai and English labels from the approved record.

## Translation operating model

- Human-review fixed navigation, consent, privacy, assistance, and safety content.
- Translate curated destination content before publication, retaining source and reviewer state.
- Use the AI provider for conversational language only within grounding rules.
- Do not dynamically translate phone numbers, dates, addresses, or emergency classifications without structured validation.
- Do not add a separate translation API in the first build unless measured need justifies it.

Google Cloud Translation is a possible future adapter and currently prices text by processed characters, with a monthly credit on its standard service; prices and Thai quality must be rechecked at implementation ([official pricing](https://cloud.google.com/translate/pricing)). DeepL now lists Thai support, but the language pair must be evaluated rather than assumed equivalent ([supported-language API](https://developers.deepl.com/api-reference/languages/retrieve-supported-languages)).

## Expansion order

1. English and Thai core
2. One language selected from measured launch users, search logs, tourism evidence, and reviewer availability
3. Additional languages one at a time after safety and retrieval evaluation

No third language is selected in this phase. Candidate choice is a founder decision after pilot evidence, not an assumption based solely on national arrival totals.

## Acceptance criteria

- Bilingual glossary for categories, emergency services, dietary terms, place qualifiers, and date/status labels
- Approved transliteration and alias policy
- Native/fluent review of all consequential fixed content
- Language-specific AI evaluation for groundedness and refusals
- Tested fallback to show Thai canonical text when a translation is missing
- Explicit UI indication when content is machine-translated

## Uncertainties

- Availability and cost of qualified Thai editorial review
- Actual language distribution within the bounded pilot
- Model accuracy for mixed Thai/English place queries
- Whether a dedicated translation provider is needed after pilot usage
