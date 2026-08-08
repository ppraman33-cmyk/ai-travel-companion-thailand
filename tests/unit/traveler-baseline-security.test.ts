import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("traveler baseline high-defect regressions", () => {
  it("keeps deployment configuration absent until explicitly approved", () => {
    expect(existsSync(resolve(process.cwd(), "netlify.toml"))).toBe(false);
    expect(existsSync(resolve(process.cwd(), "vercel.json"))).toBe(false);
  });

  it("uses no unproven external image in Trips or production CSP", () => {
    expect(read("app/trips/page.tsx")).not.toMatch(/https?:\/\//);
    expect(read("proxy.ts")).not.toContain("images.pexels.com");
  });

  it("posts itinerary items to the canonical owned-Trip route", () => {
    const client = read("components/traveler/trips-client.tsx");
    expect(client).toContain("/api/v1/trips/${activeTrip.id}/items");
    expect(client).not.toContain('fetch("/api/v1/trips/items"');
  });

  it("validates plannedAt instead of silently stripping it", () => {
    const route = read("app/api/v1/[...resource]/route.ts");
    expect(route).toContain("plannedAt: z");
    expect(route).toContain("(?:[01]\\d|2[0-3]):[0-5]\\d");
  });

  it("does not fall back from the server service-role boundary to a public key", () => {
    const runtime = read("server/runtime.ts");
    expect(runtime).toContain("process.env.SUPABASE_SERVICE_ROLE_KEY;");
    expect(runtime).not.toMatch(/SERVICE_ROLE_KEY\s*\?\?/);
  });
});
