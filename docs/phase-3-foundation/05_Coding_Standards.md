# Coding Standards

## Language and formatting

- TypeScript runs in strict mode; do not bypass boundaries with `any`.
- Use the `@/` path alias and absolute project imports.
- ESLint and Prettier are mandatory quality gates; EditorConfig supplies editor-neutral basics.
- Prefer immutable inputs and return values for contracts.
- Use `Result<T, E>` for expected failures and the common application error taxonomy.
- Validate untrusted input in isolated schemas before it reaches application or domain code.
- Inject service and repository dependencies; do not create singleton business services.
- UI code may not import infrastructure or provider adapters directly.

## Naming and organization

Keep domain types provider-independent. Repository interfaces belong to the domain, use-case
contracts belong to the application layer, and concrete technical adapters belong to
infrastructure or provider folders. Tests mirror behavior and use explicit synthetic labels.

## Security baseline

## Current controls

- Strict TypeScript and schema-based environment validation
- Deny-by-default feature flags
- Explicit error and result models to avoid accidental exception leakage
- Log-context redaction for likely secret fields
- Security response headers, including clickjacking and content-type protections
- Anonymous-session contract without account collection
- No credentials, persistent data, external API calls, or production records
- CI permissions restricted to repository read access

The Content Security Policy is intentionally narrow for the current shell. Approved external
assets or providers will require a reviewed, least-privilege directive change.

## Required later controls

Concrete adapters must implement authorization, input validation, rate limiting, timeouts, bounded
retries, auditability, and safe failure behavior. Admin authorization must be enforced server-side.
Emergency publication must fail closed when verification is missing, expired, disputed, or
suppressed. AI output must be grounded in deterministic authorized catalog records and must not be
treated as a source of real-world facts.

## Privacy

Anonymous sessions are the MVP identity approach. Collect only data necessary for an active
traveler experience, define retention before persistence begins, and avoid precise location history
unless an approved feature strictly requires it. Never place personal data or exact traveler
location in routine logs.

## Licensing and provenance

Real records and images cannot be published until source, authorization, license, attribution, and
verification evidence is complete. AI-generated media may be decorative or atmospheric only and
must never represent a real place deceptively.
