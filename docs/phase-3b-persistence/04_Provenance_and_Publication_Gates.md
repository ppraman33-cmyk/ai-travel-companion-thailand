# Provenance and Publication Gates

## Assertion-level provenance

A Source records ownership, reference, access time, rights state, license, and evidence notes.
Source assertions capture a field key, claimed-value snapshot, observation/effective/expiry dates,
confidence, review state, reviewer, and recheck date. Typed link tables preserve relational
integrity for Place, Food, and Event publication.

## Rights and verification

Licenses record commercial use, modification, storage, redistribution, attribution, expiry,
evidence, and approval. Verification records require a reviewer and verification timestamp when
verified. Next-review and stale dates make freshness explicit.

Public Place policy requires at least one current verified assertion from an approved Source.
Future workflow code must evaluate all required field-level assertions rather than treating this
minimum database gate as editorial completeness.

## Media

Media records link both Source and License. Expired/takedown states remain auditable. A constraint
prohibits AI-generated decorative assets from depicting a real Place or using a documentary-gallery
context. Synthetic media cannot be published.

## Emergency gate

Emergency profiles require an authoritative Source, primary verification, named safety reviewer,
verification/recheck/stale dates, and explicit suppression state. Unsuppressed profiles require a
verified, publication-permitted phone. Synthetic callable phone patterns are rejected. Public RLS
also requires a real, published, verified, non-suppressed Place and a non-stale eligible profile.
Critical profile changes create bounded audit records.

## Synthetic prohibition

Database triggers reject `synthetic` plus `published` for Places, Food, Events, and media.
Destinations reject synthetic activation. Synthetic emergency contacts must remain non-callable.
There is no promotion operation from synthetic to real.
