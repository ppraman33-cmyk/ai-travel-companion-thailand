import type { NextRequest } from "next/server";

export const sessionCookieName = "atct_session";
export const csrfCookieName = "atct_csrf";

export function mutationIsAllowed(request: NextRequest): boolean {
  const expectedOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  if (origin && origin !== expectedOrigin) return false;
  const cookieToken = request.cookies.get(csrfCookieName)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  return Boolean(cookieToken && headerToken && cookieToken === headerToken);
}
