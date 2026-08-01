import { describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ eq, maybeSingle }));
const select = vi.fn(() => ({ eq }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: { getUser }, from: () => ({ select }) })),
}));

import { SupabaseAdminAccess } from "@/infrastructure/auth/supabase-admin-access";

describe("SupabaseAdminAccess", () => {
  it("fails closed when Supabase cannot verify the token", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("bad token"),
    });
    const result = await new SupabaseAdminAccess(
      "http://localhost:54321",
      "key",
      "bad",
    ).resolveCurrentAdmin();
    expect(result).toEqual({ ok: true, value: null });
    expect(select).not.toHaveBeenCalled();
  });

  it("derives the role from the active server-side admin record", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "auth-user" } }, error: null });
    maybeSingle.mockResolvedValueOnce({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        role: "editor",
        active: true,
      },
      error: null,
    });
    const result = await new SupabaseAdminAccess(
      "http://localhost:54321",
      "key",
      "valid",
    ).resolveCurrentAdmin();
    expect(result).toEqual({
      ok: true,
      value: { id: "11111111-1111-4111-8111-111111111111", role: "editor" },
    });
  });
});
