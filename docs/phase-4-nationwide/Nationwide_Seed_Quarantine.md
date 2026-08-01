# Nationwide Draft Seed Quarantine

`supabase/nationwide-draft-seed.sql` contains real Thai province names and official-style codes but
does not yet have an approved provenance, ownership/licensing, and verification package. It is an
evidence-pending non-production fixture, not a production-ready seed.

The file is excluded from `supabase/config.toml`, so `supabase db reset` does not load it. The Phase 4
SQL safety test imports it explicitly inside the test workflow to verify that all 77 identities stay
unpublished and cannot be activated without evidence. This explicit test import does not authorize
production use.

Moving this fixture into any automatic or production pipeline requires Founder approval, an approved
source URL and evidence locator, rights/ownership review, verification records, and a separate schema
contract update. No external data or imagery was added during M1 Closure.
