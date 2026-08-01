import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

import {
  AdminEvidenceMutationService,
  adminEvidenceMutationSchema,
} from "@/application/admin/evidence-mutation";
import {
  ADMIN_ACCESS_COOKIE,
  createAdminAccess,
} from "@/infrastructure/auth/supabase-admin-access";
import { SupabaseAdminEvidenceRepository } from "@/infrastructure/repositories/supabase-admin-evidence-repository";
import { mutationIsAllowed } from "@/server/http-security";

const maxBodyBytes = 48 * 1024;
const response = (status: number, code: string, message: string, data?: unknown) =>
  Response.json(
    {
      ok: status < 400,
      ...(data === undefined ? { error: { code, message } } : { data }),
    },
    { status },
  );

export async function POST(request: NextRequest) {
  if (!mutationIsAllowed(request))
    return response(403, "FORBIDDEN", "Origin or CSRF validation failed.");
  if (
    !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")
  )
    return response(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json.",
    );
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > maxBodyBytes)
    return response(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");

  const token = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const access = createAdminAccess(token);
  if (!access)
    return response(401, "UNAUTHORIZED", "Admin authentication is required.");
  const actor = await access.resolveCurrentAdmin();
  if (!actor.ok)
    return response(
      503,
      "AUTH_UNAVAILABLE",
      "Admin authorization is temporarily unavailable.",
    );
  if (!actor.value)
    return response(403, "FORBIDDEN", "Active admin access is required.");

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBodyBytes)
    return response(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return response(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  const parsed = adminEvidenceMutationSchema.safeParse(json);
  if (!parsed.success)
    return response(
      400,
      "VALIDATION",
      "Request body did not match the evidence mutation contract.",
    );

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !token)
    return response(503, "UNAVAILABLE", "Evidence persistence is not configured.");
  const correlationId = randomUUID();
  const result = await new AdminEvidenceMutationService(
    new SupabaseAdminEvidenceRepository(url, key, token),
  ).execute(actor.value, parsed.data, correlationId);
  if (!result.ok)
    return response(
      result.error.code === "PERMISSION" ? 403 : 422,
      result.error.code,
      result.error.message,
    );
  return response(200, "OK", "Evidence mutation completed.", {
    result: result.value,
    correlationId,
  });
}
