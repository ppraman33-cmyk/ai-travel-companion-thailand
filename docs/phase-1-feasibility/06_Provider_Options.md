# Provider Options

## Assessment basis

- Assessment date: 2026-07-29
- Prices and terms change; recheck before procurement.
- Thai-language quality must be tested, not inferred from a provider’s language list.
- MVP rule: one primary implementation per capability, behind a narrow internal interface.

## Recommended stack summary

| Capability | Primary MVP option | Future fallback/migration | Initial decision |
|---|---|---|---|
| AI | OpenAI API, cost-efficient model selected at implementation | Google Gemini or Anthropic adapter after evaluation | Use one provider; do not implement live routing |
| Weather | Defer unless pilot requires it; then Open-Meteo commercial plan | OpenWeather or authorized Thai source | Free Open-Meteo is noncommercial; do not assume launch rights |
| Translation | Human-reviewed fixed bilingual content; AI provider for conversational output | Google Cloud Translation or DeepL | Avoid separate API initially |
| Analytics | Cloudflare Web Analytics plus minimal internal counters | PostHog | Avoid session replay and ad-tech analytics |
| Authentication | Anonymous server session; Supabase Auth only for optional future accounts | Standards-based external identity provider | No required account |
| Database | Supabase managed PostgreSQL | Portable managed PostgreSQL | Avoid proprietary data modeling where practical |
| Hosting | Cloudflare Pages/Workers | Vercel, Render, or conventional container host | One application deployment |
| Object storage | Supabase Storage initially | Cloudflare R2 or S3-compatible storage | Store only authorized media |
| Email | Resend free/low tier for transactional founder messages | Postmark or ordinary SMTP | No marketing automation |
| Error monitoring | Sentry Developer tier | Structured logs plus another OpenTelemetry-compatible service | Disable sensitive payload capture |
| Maps handoff | Google Maps URLs and Apple Maps URLs | Web browser map fallback | No Places, routes, or embedded map API |

## Category analysis

### AI

- **Free tier:** do not plan production economics around promotional credits.
- **Cost:** usage-based tokens; model choice and response length dominate.
- **Lock-in:** moderate; structured response and tool conventions vary.
- **Terms/retention:** API data controls must be reviewed; OpenAI documents default application-state retention for some endpoints ([data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)).
- **Thai:** promising but requires destination-specific evaluation.
- **Failure:** deterministic record browsing and emergency search remain available.
- **Migration:** moderate if prompts, schemas, and provider identifiers stay behind an adapter.
- **Recommendation:** OpenAI primary because the project is AI-intensive and can use one mature API; choose the current cost-efficient model only at implementation after evaluation. Do not hard-code a model in the blueprint.

### Weather

- Open-Meteo’s free API is described as noncommercial; its subscription supplies commercial-use rights and fixed call budgets ([official pricing](https://open-meteo.com/en/pricing)).
- Weather data carries attribution requirements and caching terms.
- **Recommendation:** omit live weather from the first thin slice. If required for pilot, purchase an appropriate commercial plan after legal/term review and cache conservatively. Avoid silently using the free endpoint for a future monetized product.

### Translation

- Google Cloud Translation lists a monthly credit and usage-based character pricing ([official pricing](https://cloud.google.com/translate/pricing)).
- DeepL lists Thai, but quality and retention require testing ([languages](https://developers.deepl.com/api-reference/languages/retrieve-supported-languages)).
- **Recommendation:** human-review fixed English/Thai safety content and use the AI provider for bounded conversation. Add a translation API only after measured volume.

### Analytics

- **Primary:** Cloudflare Web Analytics for basic traffic plus privacy-filtered first-party counters.
- **Cost:** expected free/low fixed cost; confirm current terms.
- **Lock-in:** low if business events remain internal and exportable.
- **Failure:** no effect on product.
- **Avoid:** session replay, advertising IDs, precise coordinates, full queries, or chat content.

### Authentication

- **Primary:** anonymous server session; Supabase Auth becomes an optional-account path.
- Supabase combines managed PostgreSQL, auth, and storage; official pricing currently shows free and Pro tiers, with Pro starting at USD 25 and included database capacity/backups ([pricing](https://supabase.com/pricing)).
- **Lock-in:** low-to-moderate for PostgreSQL, higher if application logic relies heavily on provider-specific auth/storage internals.
- **Failure:** local cached trip remains readable; new protected changes pause safely.

### Database

- **Primary:** managed PostgreSQL through Supabase for solo-founder operations.
- **Fixed cost:** free for development; budget for Pro before public launch.
- **Migration:** standard SQL and export reduce difficulty; avoid relying on auto-generated APIs as the core application boundary.
- **Avoid:** multiple databases, separate vector database, search cluster, and warehouse in MVP.

### Hosting

- **Primary:** Cloudflare Pages/Workers for static delivery and bounded server execution.
- Workers has a free plan and a paid plan with a low monthly minimum; it also documents CPU limits to reduce runaway usage ([official pricing](https://developers.cloudflare.com/workers/platform/pricing/)).
- **Lock-in:** moderate if edge-specific stateful features are used; keep the modular monolith portable and avoid them initially.
- **Fallback:** conventional container/serverless host.

### Object storage

- **Primary:** Supabase Storage for operational simplicity.
- **Fallback:** S3-compatible storage such as R2.
- **Risk:** storage rights do not equal content rights; every object requires an authorized asset record.
- **Failure:** show neutral placeholders; never substitute decorative AI imagery for a real place.

### Email

- **Primary:** Resend for low-volume transactional email; recheck its current free and overage tiers ([pricing](https://resend.com/pricing)).
- **Fallback:** Postmark or SMTP provider.
- **Avoid:** marketing campaigns and account recovery email if accounts are not yet offered.

### Error monitoring

- Sentry currently lists a free single-user Developer plan with bounded errors and logs ([pricing](https://sentry.io/pricing/)).
- Scrub prompts, precise location, authorization data, phone numbers, and trip details before capture.
- Product operation must not depend on monitoring availability.

### Maps handoff

- Google documents universal Maps URLs for application handoff ([Google documentation](https://developers.google.com/maps/documentation/urls/ios-urlscheme)); Apple documents unified Maps URLs ([Apple documentation](https://developer.apple.com/documentation/mapkit/unified-map-urls)).
- **Cost:** URL handoff should not require a paid routing or Places API; confirm terms during implementation.
- **Avoid:** Google Places data, route matrices, embedded navigation, public geocoder dependence, and copied map imagery.

## Services to avoid initially

- Multi-cloud or active multi-provider AI routing
- Kubernetes, microservices, event streaming, and dedicated search
- Paid map/places/routing APIs
- SMS authentication
- Session replay and behavioral advertising tools
- Real-time notification infrastructure
- Automated translation of the full catalog
- Commercial weather until the feature passes value/cost review
- Enterprise plans and team features

## Founder approvals

- Primary AI provider after retention and Thai-quality review
- Whether weather is in the pilot
- Supabase and Cloudflare data-location/processor acceptability
- Monthly budgets and automatic provider shutdown
- Whether optional accounts are funded in the MVP
