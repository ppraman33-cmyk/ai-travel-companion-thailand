# Phase 3C Content Operations

## Lifecycle and transactions

The application layer defines entity-aware `draft`, `evidence_pending`, `review_pending`,
`approved`, `published`, `suppressed`, and `archived` transitions. Invalid transitions return
provider-neutral Conflict errors. Only eligible approved records can publish. Archived records may
return to draft for a new review cycle; suppressed emergency restoration requires Founder authority.

`ContentOperationsRepository.transaction` owns atomicity. Content changes and their audit event
complete together; an audit failure rolls the operation back. Database constraints remain the final
safety boundary.

## Publication eligibility

Structured decisions include eligibility, reasons, warnings, missing requirements, stale
requirements, rights issues, and emergency-critical failures. Checks cover classification, Thai
identity, destination activation, reviewed translation, source rights, assertions, verification,
freshness, suppression, media rights, occurrence activity, emergency authority, phone verification,
secondary review, and the database emergency gate. Synthetic content is always ineligible.

## Roles and workflows

Editors may draft, edit, attach evidence, translate, and submit ordinary content. Founder authority
is required for emergency publication/restoration and media publication. The Admin application
service exposes dashboard and queue boundaries for drafts, evidence, review, stale, suppressed,
emergency, licenses, and reports without introducing a custom permission framework.

Every mutation emits bounded safe audit metadata: actor, action, kind, ID, correlation ID, status,
and classification. Secrets, session tokens, raw evidence, and unrestricted before/after payloads
are excluded.

## Admin interface

The desktop-first dashboard component provides operational navigation, queue counts, status
summaries, blocking reasons, warning treatments, keyboard-visible links, and responsive cards.
The `/admin` route denies access by default because Supabase Auth cannot be fully verified without
the local stack. No preview or fake authorization is enabled.

## Deferred decisions

Concrete Supabase Admin Auth composition, binary media upload, controlled override policy,
transactional PostgreSQL adapter implementation for the broad content repository, and real
verification roles remain deferred until the local Supabase stack and founder decisions are
available.
