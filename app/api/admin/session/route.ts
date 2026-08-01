import type { NextRequest } from "next/server";

import {
  ADMIN_ACCESS_COOKIE,
  createAdminAccess,
} from "@/infrastructure/auth/supabase-admin-access";
import { mutationIsAllowed } from "@/server/http-security";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(request: NextRequest) {
  if (!mutationIsAllowed(request))
    return Response.json(
      {
        ok: false,
        error: { code: "FORBIDDEN", message: "Origin or CSRF validation failed." },
      },
      { status: 403 },
    );
  if (
    !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")
  )
    return Response.json(
      {
        ok: false,
        error: {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Content-Type must be application/json.",
        },
      },
      { status: 415 },
    );
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > 16 * 1024)
    return Response.json(
      {
        ok: false,
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large." },
      },
      { status: 413 },
    );
  let token: string | undefined;
  try {
    token = (JSON.parse(raw) as { accessToken?: unknown }).accessToken as
      string | undefined;
  } catch {
    token = undefined;
  }
  if (typeof token !== "string" || token.length < 32 || token.length > 8192)
    return Response.json(
      {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "A valid Supabase access token is required.",
        },
      },
      { status: 400 },
    );
  const access = createAdminAccess(token);
  const actor = access ? await access.resolveCurrentAdmin() : null;
  if (!actor?.ok || !actor.value)
    return Response.json(
      {
        ok: false,
        error: { code: "FORBIDDEN", message: "Active admin access is required." },
      },
      { status: 403 },
    );
  const response = Response.json({ ok: true, data: { role: actor.value.role } });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_ACCESS_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${cookieOptions.secure ? "; Secure" : ""}`,
  );
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!mutationIsAllowed(request))
    return Response.json(
      {
        ok: false,
        error: { code: "FORBIDDEN", message: "Origin or CSRF validation failed." },
      },
      { status: 403 },
    );
  const response = Response.json({ ok: true, data: { signedOut: true } });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_ACCESS_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieOptions.secure ? "; Secure" : ""}`,
  );
  return response;
}
