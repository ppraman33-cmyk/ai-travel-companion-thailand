# Privacy and Retention Proposal

## Status

This is a data-minimization proposal, not a statement of legal compliance. Thailand PDPA, cross-border transfers, cookies, processor terms, lawful bases, notices, rights handling, security incidents, and obligations in traveler jurisdictions require qualified legal review.

## Principles

- Collect only what a current MVP feature needs.
- Prefer guest use and manually selected areas.
- Do not collect background location.
- Separate content-quality evidence from traveler identity.
- Use short default retention and explicit extension for saved trips.
- Do not send raw prompts, coordinates, or itineraries to analytics or error tools.

## Proposed retention schedule

| Data | Proposed default | Rationale and deletion behavior |
|---|---|---|
| Guest session identifier | 30 days after last activity | Rotate; delete or irreversibly invalidate with session deletion |
| Account data | No MVP account; if later used, while active plus 30 days after deletion request for operational deletion | Exact residual legal/security retention requires legal review |
| Saved guest trips | 90 days after last activity; user may delete sooner | Warn before expiry where a contact method exists; purge projections and caches |
| Precise location | Process transiently; do not persist by default | Round or discard after nearby query; never build movement history |
| Search history | Do not retain as user history; aggregated counters up to 30 days | Remove query text and precise location from analytics |
| AI conversations | 7 days for session continuity by default | Allow immediate deletion; do not use as durable memory |
| AI summaries | 30 days or with the saved trip, whichever is shorter unless user explicitly saves it | Mark as derived and regenerate when source freshness changes |
| Analytics events | Raw pseudonymous events 30 days; aggregated non-identifying metrics 13 months | Revisit with legal review and actual analytics provider |
| Error logs | 14 days | Scrub prompts, coordinates, tokens, contacts, and trip contents |
| Incorrect-information reports | 180 days after resolution | Minimize reporter data; retain longer only for disputes or safety with approved basis |
| Administrative audit logs | 24 months | Supports provenance, takedown, emergency, and access accountability; legal review required |
| Provider usage/rate-limit records | 30 days, aggregated budget totals 13 months | Keep only session hash/coarse network signals needed for abuse investigation |
| Backups | Rolling 30 days for MVP | Deletions age out; document restoration re-deletion procedure |

These periods are recommendations and founder decisions, not finalized legal requirements.

## Location handling

- Ask only when “nearby” materially benefits the traveler.
- Offer manual area selection.
- Use coordinates in memory for the current query.
- If temporary server processing is required, do not log raw coordinates.
- Store a saved place identifier, not a trail of positions.
- Background geolocation is prohibited in the MVP.

## AI and provider handling

- Send only context required for the current answer.
- Remove direct identifiers and unnecessary trip details.
- Disable provider-side storage where supported and consistent with functionality.
- Review provider default retention; OpenAI documents endpoint-specific application-state retention behavior that must be configured deliberately ([API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)).
- Do not use traveler content for model training without a new explicit policy and qualified review.

## User controls

- Clear explanation of guest-session limits and expiry
- Delete conversation, trip, and current guest session
- Location permission denial without blocking core discovery
- Review of saved trip facts and AI summaries
- Privacy contact and rights-request path
- Cookie controls appropriate to the final analytics and legal assessment

## Legal review questions

- Controller/processor roles and lawful bases
- Whether and how consent is required
- Cross-border transfer safeguards and notices
- Cookie and analytics requirements
- Data-subject access, correction, deletion, and portability
- Children/minors and family-trip implications
- Breach notification duties
- Mandatory retention or legal-hold rules
- Whether precise location or health/accessibility preferences need enhanced handling
- Processor agreements and subprocessor disclosures

## Founder approvals

- Proposed retention periods
- Whether conversations are retained for seven days or only in-session
- Whether optional accounts are post-MVP
- Analytics raw/aggregate periods
- Legal-review budget and reviewer
