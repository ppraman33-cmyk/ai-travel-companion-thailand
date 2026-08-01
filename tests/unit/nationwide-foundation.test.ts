import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608010008_nationwide_content_foundation.sql",
  ),
  "utf8",
);
const draftSeed = readFileSync(
  resolve(process.cwd(), "supabase/nationwide-draft-seed.sql"),
  "utf8",
);

describe("Phase 4 nationwide foundation", () => {
  it("contains exactly 77 unique standardized province codes", () => {
    const codes =
      draftSeed.match(/'TH-\d{2}'/g)?.map((code) => code.slice(1, -1)) ?? [];
    expect(codes).toHaveLength(77);
    expect(new Set(codes).size).toBe(77);
  });

  it("imports real province identities only into unpublished workflow states", () => {
    expect(draftSeed).toContain("'evidence_pending'");
    expect(draftSeed).toContain("'unverified'::public.verification_status");
    expect(draftSeed).not.toMatch(/'active'\s*,\s*'real'/);
    expect(draftSeed).not.toContain("profile_source_id");
  });

  it("keeps internal notes private and public views under invoker RLS", () => {
    expect(migration).toContain("with (security_invoker = true)");
    expect(migration).toContain("Never expose through public catalog contracts");
    expect(migration).toContain("profile_verification_status = 'verified'");
    expect(migration).toContain("profile_source_id is not null");
  });
});
