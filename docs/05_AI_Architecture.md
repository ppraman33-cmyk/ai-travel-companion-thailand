# AI Architecture

## Purpose

The AI layer helps foreign tourists interpret approved travel records and plan trips. It is not a source of real-world truth, an emergency service, a navigation engine, or a system of record.

## Grounding requirements

Responses about real places, restaurants, food venues, attractions, events, markets, activities, emergency services, opening hours, dates, fees, phone numbers, addresses, and contact details must be grounded in approved structured records and authorized sources.

The AI must not invent real-world entities or volatile facts. When required provenance is absent, expired, disputed, or insufficient, the system must omit the claim, state that it cannot verify it, or direct the user to an appropriate authoritative source.

Emergency answers must retrieve first-class structured emergency records. Model memory, unrestricted generation, and unverified live content are not acceptable sources for emergency facilities or contact details.

## MVP pipeline

1. Accept the request and only the permitted trip context.
2. Detect language, intent, relevant location, urgency, and risk.
3. Resolve ambiguous Thai names, dates, and traveler constraints.
4. Retrieve approved records filtered by publication, license, verification, and freshness.
5. Build a bounded context with assertion-level sources where required.
6. Generate a candidate response using the approved provider interface.
7. Validate entity references, citations, limitations, size, and safety policy.
8. Present the response with verification, freshness, uncertainty, and external actions.
9. Record privacy-safe quality, usage, latency, and cost signals.

Unrestricted live web browsing is not part of the MVP. Future live retrieval requires an approved source policy, licensing review, content-isolation controls, and evaluation.

## Provider strategy

The MVP uses a provider-neutral internal interface with one primary approved implementation. A second active provider is not required at launch. Prompts, model choice, request settings, and structured output versions remain outside core business records so the provider can be replaced later.

A fallback may be a second provider, a smaller approved model, a deterministic template, or temporary AI unavailability. The choice is made during detailed design based on quality, cost, data handling, and operational simplicity.

## Cost and abuse controls

Before launch, define and enforce:

- Per-user or per-device request limits
- Global rate and concurrency limits
- Input and output token limits
- Maximum response and itinerary sizes
- Request latency and cancellation limits
- Monthly provider budget and warning thresholds
- Bot and repeated-request abuse detection
- Cost telemetry by capability and successful task
- Graceful degradation when a limit or budget is reached

The traveler remains a free user; limitation messaging must not imply a paid upgrade.

## Safety behavior

Higher-risk topics—including emergency, medical, legal or visa, severe weather, transportation safety, exploitation, and financial transactions—use stricter source and freshness thresholds. The product states its limits and does not substitute for qualified or official assistance.

Prompt-injection defenses treat source documents, provider content, and user text as untrusted data. Tools are allow-listed, arguments are validated, results are constrained, and authorization is enforced outside the model.

## Hallucination controls

- Evidence-first generation
- Allow-listing of entity identifiers supplied to the model
- Citation-to-claim and identifier validation
- Deterministic handling of dates, currencies, and itinerary constraints where practical
- Conflict and staleness detection
- Calibrated unknown, refusal, and partial-answer behavior
- No fabricated availability, regulation, hours, fees, dates, addresses, or contact details

## Multilingual design and evaluation

The initial supported languages are unresolved and must be approved before implementation. Evaluation must cover each approved language, Thai names and script, transliteration variants, ambiguous locations, cultural appropriateness, sparse evidence, emergency queries, and prompt-injection attacks.

Human review should include Thai travel-domain expertise and fluent reviewers for safety-critical content in every supported language.

## Personalization and memory

- Session context supports the current interaction.
- Trip context contains explicit, user-visible facts.
- Durable preferences require a clear benefit and user control.
- Sensitive traits are not inferred into durable memory.
- Raw conversation retention is minimized and configurable.

## AI-generated image boundary

AI image generation is not used to represent or document real places, restaurants, dishes, events, attractions, hospitals, or emergency services. Generated images are restricted to decorative, category, branding, marketing, or atmospheric use, carry internal generation provenance, and are disclosed when users could reasonably mistake them for documentary content.

## Deterministic fallback

If AI is unavailable or over budget, travelers can still browse verified records, inspect emergency information, access saved trip data, use basic filters, and hand destinations to Google Maps or Apple Maps. The product must never replace missing AI output with unsupported factual generation.

## Future state

Multiple live model providers, specialized routing, automated prompt optimization, broader language coverage, and approved live-source retrieval may be introduced only after measurable need and evaluation.

## Launch gate

Every AI capability requires an intended-use statement, prohibited-use list, source policy, language-specific evaluation threshold, cost ceiling, fallback, monitoring owner, and rollback procedure.
