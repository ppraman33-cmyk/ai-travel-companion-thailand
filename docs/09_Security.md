# Security, Privacy, Safety, and Rights

## Objectives

Protect traveler data, trip context, optional location, privileged operations, provider credentials, content rights, and the integrity of travel and emergency information. Controls must be proportionate to a solo-founder MVP without weakening mandatory safety boundaries.

## MVP threat model

- Account or administrator-session takeover
- Broken authorization across trips and protected content operations
- Exposure of precise location, itinerary, or conversation data
- AI prompt injection, data exfiltration, and unsafe tool use
- Bot abuse, anonymous abuse, AI cost exhaustion, and resource denial
- Malicious or corrupted external data
- Inaccurate, stale, or manipulated emergency records
- Unlicensed data or images and ignored takedown obligations
- AI-generated imagery misleading users about real entities
- Secret leakage, insecure logs, dependency compromise, and provider outage

## Location and privacy

- Precise location is optional and requested only for an immediate feature.
- Manual destination or area selection remains available.
- Background location tracking is excluded from the MVP.
- Precise location history is not retained unless a separately approved need, notice, and retention rule exists.
- Logs and analytics avoid raw coordinates, full itineraries, and conversation content where possible.
- Conversation and trip retention, access, export, and deletion behavior must be defined before launch.

## Identity and authorization

Guest use should be considered to reduce unnecessary account data. Authenticated and administrative actions use secure sessions and server-side authorization. Administrator access requires strong authentication, least privilege, no shared accounts, and audit history for sensitive changes.

## AI and abuse controls

- Per-user or per-device and global rate limits
- Token, response, itinerary, latency, and concurrency limits
- Bot and repeated-request detection
- Monthly provider budgets and automatic protective thresholds
- Restricted, schema-constrained tools with authorization outside the model
- Untrusted-content isolation and prompt-injection evaluation
- No unrestricted live web browsing in the MVP
- Deterministic content availability during AI failure or budget exhaustion

## Emergency-data integrity

Emergency phone, address, location, operating state, and service classification are safety-critical. They require approved sources, stricter verification intervals, audit history, conflict handling, and suppression when expired or unreliable. The AI may not supply missing emergency details from model memory.

The product identifies itself as an information aid, not an emergency service, and directs users to official help without claiming guaranteed accuracy or availability.

## Data and image rights

Publication controls must enforce source, license, attribution, permitted use, expiry, and takedown status. Image origin is classified, and documentary images of real entities require authorized real-image rights. AI-generated decorative images must not imply that they document a real place, dish, event, attraction, hospital, or assistance service.

Takedown procedures cover public delivery, cached and search projections, provider-hosted assets, and retained audit evidence. Qualified advice is required for legal conclusions.

## Third-party and provider review

Before use, review each provider’s:

- Data locations and subprocessors
- Retention and model-training terms
- Security controls and breach obligations
- Cross-border transfer implications
- License, attribution, caching, and redistribution terms
- Quotas, budget controls, termination, and data-export options

The project must not state that it complies with Thailand’s PDPA or another law until qualified legal review confirms the applicable obligations and implementation.

## Mandatory MVP controls

- Encrypted transport and supported encryption at rest
- Managed secret storage and rotation process
- Server-side validation, authorization, and output encoding
- Dependency and secret scanning
- Protected production access and minimal logging of sensitive data
- Backups and a tested restore
- Rate limits and provider budget limits
- Privileged audit history
- Content license and emergency-integrity publication gates
- Incident and takedown procedures

## Solo-founder incident procedure

1. Detect and record the issue without unnecessarily copying sensitive data.
2. Contain it by disabling the affected feature, provider, record, media asset, or credential.
3. Preserve essential evidence and assess user, safety, rights, and legal impact.
4. Correct or restore verified service.
5. Obtain qualified advice and notify affected parties or authorities when required.
6. Document the cause, decision, remediation, and prevention action.

Prewritten contacts, provider shutdown steps, credential-rotation instructions, and a public status or support channel should exist before launch.

## Future-state assurance

Dedicated security staffing, formal separation of duties, device or network restrictions, independent penetration testing, expanded red-team programs, advanced fraud systems, signed provenance pipelines, and complex security monitoring are introduced as scale and risk justify them.
