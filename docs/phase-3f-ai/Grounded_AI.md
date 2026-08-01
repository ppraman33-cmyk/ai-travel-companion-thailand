# Phase 3F Grounded AI

## Architecture and grounding

`GroundedAIService` depends on replaceable structured provider, quota, and usage-accounting
contracts. It accepts only already-eligible candidate records. The provider sees bounded IDs,
names, and supported facts—not private evidence or an unrestricted database.

Structured output contains text, recommended IDs, assumptions, warnings, unresolved questions,
grounding references, and support status. The server rejects unknown IDs, excess recommendations,
oversized inputs, and prompt-injection patterns. Authoritative record details are assembled from the
original candidates rather than model prose.

## Provider and live status

No live vendor adapter or credential exists. The API fails safely with Unavailable and all non-AI
features continue to operate. Automated tests use a deterministic fake provider. Adding a live
provider requires explicit configuration, output-schema parsing at the adapter boundary, timeout,
terms/retention review, and cost approval.

## Cost and abuse controls

The service includes feature enablement, per-session quota, maximum candidate/input/output
boundaries, timeout, zero unbounded retry, provider-neutral failure mapping, and metadata-only usage
accounting with estimated cost. Raw prompts and responses are not persisted by the accounting
contract. A production kill switch is the AI feature flag.

## Emergency and privacy

Emergency context is refused before provider invocation. Phone numbers are never passed for
paraphrasing or accepted from model output; the application must inject validated contact actions
from eligible emergency records. The assistant does not diagnose, dispatch, book, claim live
availability, or invent safety guidance.

## Evaluation

Tests cover disabled behavior, deterministic grounding, unknown-ID rejection, prompt injection,
emergency refusal, and usage accounting. Production readiness still requires malformed-output,
provider-timeout, quota-window, cost-threshold, and human multilingual evaluation against an
approved live adapter.
