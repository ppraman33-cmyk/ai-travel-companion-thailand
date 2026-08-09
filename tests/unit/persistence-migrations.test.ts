import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationsDirectory = resolve(process.cwd(), "supabase/migrations");
const migrations = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort();
const migrationSql = migrations
  .map((file) => readFileSync(resolve(migrationsDirectory, file), "utf8"))
  .join("\n");
const seedSql = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");

describe("Phase 3B migration contract", () => {
  it("uses deterministic ordered migration names", () => {
    expect(migrations).toHaveLength(13);
    expect(migrations).toEqual([...migrations].sort());
    expect(new Set(migrations.map((file) => file.slice(0, 12))).size).toBe(
      migrations.length,
    );
  });

  it("contains required safety boundaries", () => {
    expect(migrationSql).toContain("reject_synthetic_publication");
    expect(migrationSql).toContain("enable row level security");
    expect(migrationSql).toContain("current_traveler_session_id");
    expect(migrationSql).toContain("enforce_emergency_safety");
    expect(migrationSql).not.toMatch(/create\s+extension[^;]*\bpostgis\b/i);
    expect(migrationSql).toContain("content kind does not match persisted subtype");
    expect(migrationSql).toContain("publication lifecycle transition is not permitted");
    expect(migrationSql).toContain("assertion does not belong to content");
    expect(migrationSql).toContain("real content requires atomic provenance intake");
    expect(migrationSql).toContain("Remove the earlier direct-write grants");
    expect(migrationSql).toContain("revoke insert on public.traveler_sessions");
    expect(migrationSql).toContain("reorder_itinerary_items");
    expect(migrationSql).toContain("deferrable initially immediate");
  });

  it("keeps Event and Food separate from the Place subtype constraint", () => {
    const placeConstraint = migrationSql.match(/place_category in \(([^)]+)\)/)?.[1];
    expect(placeConstraint).toBeDefined();
    expect(placeConstraint).not.toContain("'event'");
    expect(placeConstraint).not.toContain("'food'");
  });

  it("uses reserved domains and non-callable emergency fixtures", () => {
    expect(seedSql).toMatch(/example\.test/);
    expect(seedSql).toContain("NOT-CALLABLE-TEST");
    expect(seedSql).not.toMatch(/\b(?:191|199|1155|1669)\b/);
    const urls = seedSql.match(/https?:\/\/[^'\s]+/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    expect(
      urls.every((url) =>
        /https?:\/\/[^/]*(?:example\.test|example\.com|invalid)(?:\/|$)/.test(url),
      ),
    ).toBe(true);
  });

  it("contains no credentials or dynamic SQL execution", () => {
    expect(migrationSql).not.toMatch(
      /supabase_service_role_key|execute\s+format\s*\(/i,
    );
    expect(migrationSql).toContain(
      "grant execute on function public.reorder_itinerary_items(uuid, uuid, uuid, uuid[]) to service_role",
    );
    expect(seedSql).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{16,}/);
  });
});
