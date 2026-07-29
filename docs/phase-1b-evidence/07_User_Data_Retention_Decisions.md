# User Data Retention Decisions

## Status

This is a minimum-retention decision register, not a legal conclusion or compliance claim. All durations are **Proposed** until founder and qualified legal/privacy review.

Background location tracking is excluded from the MVP.

## Retention register

| Data category | Purpose / necessary? | Proposed storage | Proposed retention | Deletion and user control | Legal review | Founder status |
|---|---|---|---|---|---|---|
| Anonymous session ID | Session continuity and abuse limits / yes | Secure cookie plus server session | 30 days inactive | Delete/rotate; “delete session” control | Required | Unresolved |
| Saved trips | Deliver trip planning / yes when saved | Primary database plus local cache | 90 days inactive | User deletes immediately; purge projections and age from backups | Required | Unresolved |
| Precise location | One nearby query / optional | Memory only by default | End of request/session operation | Permission denial and manual-area alternative | Required | Unresolved |
| Search history | Product history / no for MVP | Do not keep user-level history | None; aggregate counters only | Not applicable; avoid raw query analytics | Required | Unresolved |
| AI conversation messages | Short continuity / optional | Primary database if enabled | 7 days | Delete conversation immediately; provider deletion subject to terms | Required | Unresolved |
| AI conversation summaries | Bounded context / optional | Primary database | 30 days or saved-trip lifetime, whichever is shorter | User deletion; invalidate when source facts change | Required | Unresolved |
| Analytics events | Reliability and task metrics / minimal | Approved analytics or first-party aggregate | Raw pseudonymous 30 days; aggregate 13 months | Avoid raw prompts/location; rights process required | Required | Unresolved |
| Error logs | Diagnose failures / yes, minimized | Error provider | 14 days | Scrub prompts, contacts, tokens, coordinates; provider deletion process | Required | Unresolved |
| Incorrect-information reports | Correct content and investigate safety / yes | Primary database/restricted admin | 180 days after resolution | Minimize reporter data; deletion except approved incident evidence | Required | Unresolved |
| Administrative audit logs | Provenance, rights, emergency accountability / yes | Restricted primary/audit storage | 24 months | No ordinary edit; controlled expiry/legal hold | Required | Unresolved |
| Optional account data | Cross-device/recovery / not MVP | Not selected | If introduced: active life plus proposed 30-day deletion workflow | Export/delete/recovery controls required | Required before feature | Deferred |

## Required record fields

For each category before implementation:

- Item name, category, owner/authority
- Exact fields collected
- Purpose and necessity decision
- Storage/provider and region
- Access roles
- Retention trigger and duration
- Downstream, cache, log, and backup copies
- User control and deletion service target
- Evidence obtained and restrictions
- Checked date, reviewer, status, and recheck

## Location rule

Ask for precise location only when the user requests nearby results. Process it transiently, avoid logging it, and save a selected place identifier rather than a location trail. Manual area selection must preserve core functionality.

## Provider interaction

Only necessary context may be sent to AI or other providers. Provider-side retention, training, application state, logs, regions, subprocessors, and deletion must be recorded in the provider register before use.

## Decisions requiring legal review

- Lawful basis, notices, and consent
- Cookies and analytics
- Cross-border transfer and processor agreements
- Access, correction, deletion, and portability
- Minor/family traveler implications
- Sensitive accessibility or health preferences
- Incident notification and legal holds
- Whether proposed audit and report retention is proportionate

## Founder decisions

Every row remains unresolved. Approval should record the chosen duration, legal-review reference, decision date, and revisit date in the founder decision register.
