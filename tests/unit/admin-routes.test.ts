import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { failure, success } from "@/shared/result/result";
import { appError } from "@/shared/errors/app-error";

const state = vi.hoisted(() => ({
  actor: {
    id: "10000000-0000-4000-8000-000000000001",
    role: "founder" as "founder" | "editor",
  } as { id: string; role: "founder" | "editor" } | null,
  authFailure: false,
  mutate: vi.fn(),
}));

vi.mock("@/infrastructure/auth/supabase-admin-access", () => ({
  ADMIN_ACCESS_COOKIE: "atct_admin_access_token",
  createAdminAccess: (token?: string) =>
    token
      ? {
          resolveCurrentAdmin: async () =>
            state.authFailure
              ? failure(appError("PROVIDER", "unavailable"))
              : success(state.actor),
        }
      : null,
}));
vi.mock("@/infrastructure/repositories/supabase-admin-evidence-repository", () => ({
  SupabaseAdminEvidenceRepository: class {
    mutate = state.mutate;
  },
}));
vi.mock("@/infrastructure/repositories/supabase-admin-content-repository", () => ({
  SupabaseAdminContentRepository: class {
    mutate = state.mutate;
  },
}));

import { POST as createSession } from "@/app/api/admin/session/route";
import { POST as mutateEvidence } from "@/app/api/admin/evidence/mutations/route";
import { POST as mutateContent } from "@/app/api/admin/content/mutations/route";

const token = "x".repeat(64);
const request = (
  path: string,
  body: unknown,
  options: {
    csrf?: boolean;
    origin?: string;
    token?: boolean;
    contentLength?: number;
  } = {},
) => {
  const csrf = options.csrf ?? true;
  const headers = new Headers({
    "content-type": "application/json",
    origin: options.origin ?? "http://localhost",
    ...(csrf
      ? {
          "x-csrf-token": "csrf",
          cookie: `atct_csrf=csrf${options.token === false ? "" : `; atct_admin_access_token=${token}`}`,
        }
      : {}),
    ...(options.contentLength
      ? { "content-length": String(options.contentLength) }
      : {}),
  });
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
};

describe("Admin route boundaries", () => {
  beforeEach(() => {
    state.actor = { id: "10000000-0000-4000-8000-000000000001", role: "founder" };
    state.authFailure = false;
    state.mutate.mockReset().mockResolvedValue(success({ id: "result" }));
    process.env.SUPABASE_URL = "http://localhost:54321";
    process.env.SUPABASE_PUBLISHABLE_KEY = "test-key";
  });

  it("rejects missing session and expired or inactive admin identity", async () => {
    expect(
      (
        await mutateEvidence(
          request("/api/admin/evidence/mutations", {}, { token: false }),
        )
      ).status,
    ).toBe(401);
    state.actor = null;
    expect(
      (await mutateEvidence(request("/api/admin/evidence/mutations", {}))).status,
    ).toBe(403);
  });

  it("returns a safe unavailable envelope when identity verification fails", async () => {
    state.authFailure = true;
    const response = await mutateEvidence(request("/api/admin/evidence/mutations", {}));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: "AUTH_UNAVAILABLE",
        message: "Admin authorization is temporarily unavailable.",
      },
    });
  });

  it("rejects CSRF, cross-origin, oversized, invalid, and unsupported requests", async () => {
    expect(
      (
        await mutateEvidence(
          request("/api/admin/evidence/mutations", {}, { csrf: false }),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await mutateEvidence(
          request(
            "/api/admin/evidence/mutations",
            {},
            { origin: "https://evil.example" },
          ),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await mutateEvidence(
          request("/api/admin/evidence/mutations", {}, { contentLength: 50000 }),
        )
      ).status,
    ).toBe(413);
    expect(
      (
        await mutateEvidence(
          request("/api/admin/evidence/mutations", { action: "unsupported" }),
        )
      ).status,
    ).toBe(400);
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("accepts active Founder and Editor sessions but derives their roles server-side", async () => {
    let response = await createSession(
      request("/api/admin/session", { accessToken: token }, { token: false }),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).data.role).toBe("founder");
    state.actor = { id: "editor", role: "editor" };
    response = await createSession(
      request("/api/admin/session", { accessToken: token }, { token: false }),
    );
    expect((await response.json()).data.role).toBe("editor");
  });

  it("denies Founder-only evidence operations to an active Editor", async () => {
    state.actor = { id: "editor", role: "editor" };
    const response = await mutateEvidence(
      request("/api/admin/evidence/mutations", {
        action: "create_source",
        payload: {
          sourceType: "synthetic_test",
          publisher: "Test Publisher",
          title: "Test Source",
          sourceUrl: "https://source.example.test/evidence",
          retrievedAt: "2026-01-01T00:00:00Z",
          ownershipStatus: "owned",
          rightsStatus: "approved",
          verificationStatus: "verified",
          verifiedAt: "2026-01-01T00:00:00Z",
          evidenceLocator: "TEST-EVIDENCE",
          dataClassification: "synthetic",
          license: {
            name: "Test license",
            rightsHolder: "Test Publisher",
            category: "internal_test",
            termsUrl: "https://source.example.test/terms",
            commercialUsePermitted: false,
            modificationPermitted: true,
            storagePermitted: true,
            redistributionPermitted: false,
            attributionRequired: true,
            attributionText: "TEST",
            approvalStatus: "approved",
          },
        },
      }),
    );
    expect(response.status).toBe(403);
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("rejects real draft intake without atomic provenance", async () => {
    const response = await mutateContent(
      request("/api/admin/content/mutations", {
        action: "create_place_draft",
        payload: {
          destinationId: "21000000-0000-4000-8000-000000000001",
          geographyId: "20000000-0000-4000-8000-000000000002",
          canonicalThaiName: "ทดสอบ",
          normalizedSearchName: "test",
          addressSummary: "test",
          latitude: 1,
          longitude: 1,
          placeCategory: "other",
          dataClassification: "real",
        },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("accepts a validated synthetic draft workflow", async () => {
    const command = {
      action: "create_place_draft",
      payload: {
        destinationId: "21000000-0000-4000-8000-000000000001",
        geographyId: "20000000-0000-4000-8000-000000000002",
        canonicalThaiName: "สถานที่สมมติ",
        normalizedSearchName: "synthetic place",
        addressSummary: "TEST DATA ONLY",
        latitude: 1,
        longitude: 1,
        placeCategory: "other",
        dataClassification: "synthetic",
      },
    };
    const response = await mutateContent(
      request("/api/admin/content/mutations", command),
    );
    expect(response.status).toBe(200);
    expect(state.mutate).toHaveBeenCalledWith(command, expect.any(String));
  });

  it("propagates a server correlation ID for a successful synthetic evidence workflow", async () => {
    const command = {
      action: "create_translation",
      kind: "place",
      id: "40000000-0000-4000-8000-000000000001",
      payload: {
        locale: "en",
        sourceLocale: "th",
        name: "Synthetic test",
        machineGenerated: false,
        reviewStatus: "draft",
      },
    };
    const response = await mutateEvidence(
      request("/api/admin/evidence/mutations", command),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(state.mutate).toHaveBeenCalledWith(command, body.data.correlationId);
  });
});
