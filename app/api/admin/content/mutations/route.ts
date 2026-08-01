import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

import { adminContentMutationSchema } from "@/application/admin/content-mutation";
import {
  createAdminAccess,
  ADMIN_ACCESS_COOKIE,
} from "@/infrastructure/auth/supabase-admin-access";
import { SupabaseAdminContentRepository } from "@/infrastructure/repositories/supabase-admin-content-repository";
import { mutationIsAllowed } from "@/server/http-security";

const maxBodyBytes = 32 * 1024;

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
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBodyBytes)
    return response(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const access = createAdminAccess(accessToken);
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
  const parsed = adminContentMutationSchema.safeParse(json);
  if (!parsed.success)
    return response(
      400,
      "VALIDATION",
      "Request body did not match the content mutation contract.",
    );

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !accessToken)
    return response(503, "UNAVAILABLE", "Content persistence is not configured.");
  const result = await new SupabaseAdminContentRepository(url, key, accessToken).mutate(
    parsed.data,
    randomUUID(),
  );
  if (!result.ok)
    return response(
      result.error.code === "PERMISSION" ? 403 : 422,
      result.error.code,
      result.error.message,
    );
  return response(200, "OK", "Mutation completed.", result.value);
}
