# Admin System Blueprint

## Purpose

The MVP administration capability is a small protected module for a solo founder or trusted editor. It exists to keep real-world content lawful, traceable, current, and correct; it is not an enterprise administration platform.

## MVP permission model

- **Founder administrator:** configuration, access management, publishing, emergency verification, takedown, and audit review
- **Trusted editor:** create and edit records, attach provenance and licenses, submit verification, and prepare publication changes within assigned scope

A solo launch may use only the founder administrator role. No shared accounts are permitted. Strong authentication, least privilege, and an audit trail apply to privileged actions.

## MVP capabilities

- Create, read, edit, archive, and restore approved content records
- Manage source and assertion-level provenance
- Record licenses, attribution, permitted use, expiry, and restrictions
- Classify media origin and prevent decorative AI images from being treated as documentary
- Record verification, reviewer notes, confidence, and last-checked dates
- Set draft, review, published, stale, suppressed, expired, archived, and takedown states
- Correct factual errors while retaining revision history
- Verify emergency-service records under stricter rules
- Review private incorrect-information reports
- Inspect a bounded operational audit history

## Manageable review queue

The MVP uses one prioritized queue with clear filters:

1. Emergency records approaching expiry or reported incorrect
2. Active takedown and license-expiry items
3. Event cancellations, rescheduling, and near-term occurrences
4. Other stale or disputed volatile assertions
5. Draft and routine content reviews
6. Private traveler corrections

Each item shows affected record, severity, source, required action, due date, and latest review evidence. Queue size and destination coverage must remain within one person’s sustainable capacity.

## Publication controls

Publication is blocked when required provenance, verification, or license fields are missing or invalid. Emergency contact, location, and classification assertions use shorter freshness periods than ordinary place content. License expiry or takedown can suppress affected data or media without deleting audit evidence.

AI may assist with drafts or translation but cannot publish, verify, or approve a license.

## Security and recovery

- Strong administrator authentication and secure sessions
- Server-side authorization
- Confirmation for publication, emergency changes, exports, access changes, and takedown
- Append-oriented history for privileged changes
- Minimal personal-data access
- Recoverable content revisions where lawful and practical

## Deferred capabilities

Complex role hierarchies, dual-control workflows, partner management, advanced analytics, automated bulk ingestion, destination-organization access, feature experimentation consoles, and enterprise moderation are post-MVP. They may be introduced when staffing and risk justify them.

## Implementation gate

Before detailed admin design, approve the founder/editor responsibilities, destination review volume, emergency verification process, license and takedown workflow, audit retention, and incident procedure.
