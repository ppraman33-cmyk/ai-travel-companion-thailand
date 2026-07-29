# Admin Workflows

## Roles and common rules

MVP roles are Founder and Trusted Editor. Founder controls access, critical publication, emergency decisions, and takedown. Editor prepares content and evidence within assigned scope. Every transition records actor, reason, timestamp, target revision, and correlation ID.

Common publication gates: no duplicate identity; Thai canonical name; synthetic/real classification; required source/license; current verification; subtype requirements; no prohibited media context.

## Workflow specifications

| Workflow | Preconditions and steps | Evidence/validation and transitions | Failure/audit/workload |
|---|---|---|---|
| Create record | Admin authenticated; search duplicates; create common Place/concept; add subtype; save draft | Thai name, geography/location evidence, `synthetic` required; new→draft | Duplicate candidate blocks review; audit `record.created`; batch similar fields carefully |
| Add source | Draft/existing target; enter owner/type/reference/terms evidence; submit rights review | Public access never equals approval; proposed→approved/rejected/expired | Missing authority/rights blocks use; audit `source.created/status_changed` |
| Add assertion | Select target field/source; snapshot claim/value/effective dates; review | Value type and source scope must match; pending→verified/disputed/expired | Conflicts remain visible; audit `assertion.created/verified` |
| Attach image | Register metadata before/with storage; identify subject/origin/license; set context | Asset-specific evidence; draft→rights_review | Unidentified rights holder rejects; audit storage reference without secret URL |
| Review image rights | Inspect proof, transformations, attribution, real-subject and contexts | Approved rights and nonexpired license; review→approved/rejected | AI decorative + real gallery hard failure; audit decision/reason |
| Translate content | Select source language/version; draft English/Thai; fluent review consequential fields | Preserve canonical Thai; draft→reviewed | Machine translation label/rejection; audit translator/reviewer/version |
| Verify content | Review assertions, rights, field checks, dates; set next review | Verification method/evidence/reviewer mandatory | Cannot self-certify missing evidence; audit result |
| Publish content | Preview public representation; run gates; Founder confirms | draft/in_review→published; synthetic production prohibited | Gate report blocks; audit bounded diff and reason |
| Update opening hours | Create new effective schedule/assertions; review; activate | Do not overwrite historical set; verified new schedule required | Conflict yields uncertain/suppressed field; audit old/new refs |
| Update event occurrence | Add/reschedule/cancel occurrence with organizer evidence | scheduled→rescheduled/cancelled/completed/expired | Near-term unverified occurrence suppresses; audit status and notification decision |
| Verify emergency record | Confirm authority plus secondary check; review critical fields; next date | Named human; pending→verified | Any missing phone/address/coordinate/capability suppresses field; high-priority audit |
| Suppress stale emergency | Queue/incident opens; identify affected fields; Founder suppresses; verify alternatives | verified/published→stale/suppressed | No AI completion; audit immediate reason and scope |
| Handle incorrect report | Triage severity; inspect evidence; suppress if credible critical; verify independently; resolve | open→triaged→investigating→resolved/rejected | Reporter claim is not proof; audit all status/actions |
| Expire image license | Expiry queue; block new use; remove delivery/cache; choose neutral placeholder | approved/published→expired | Never generate real-subject replacement; audit affected contexts |
| Process takedown | Authenticate request as far as possible; contain asset/data; assess terms; remove; close | any→takedown; evidence and deadlines | Escalate legal ambiguity; audit request, actions, residual evidence |
| Review audit history | Founder filters target/actor/time; inspects sequence; exports only if authorized | Read access logged for sensitive views | No editing; audit access where required; bounded retention |

## Queue ordering

Emergency incidents → active takedown/license expiry → event cancellation within 14 days → stale volatile facts → incorrect reports → new content. New publication pauses when critical queue targets are missed.

## Validation rules

- One Place identity across subtypes.
- Source assertions support the exact field/effective period.
- Current publication needs valid source/license/verification.
- Emergency critical fields use stricter freshness and named human review.
- Documentary media needs real-subject and rights evidence.
- Synthetic content never transitions to real production publication.
- State changes use optimistic revision checks.

## Failure recovery

Failed publication leaves the prior public revision unchanged. Partial media delivery is disabled on rights failure. Critical suppression is available without deployment. Restored backups must reapply takedown and current suppression state.

## Solo-founder controls

Default to one priority queue, small batches, reusable evidence templates, and no complex dual approval. Proposed workload remains 6–10 hours/week and needs measurement. Automation may remind, extract drafts, and detect changes; it cannot approve rights, emergency facts, or publication.

## Post-MVP

Complex roles, destination-scoped teams, dual control, partner submissions, automated ingestion, bulk approval, and enterprise moderation are deferred.
