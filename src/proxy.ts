import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

/**
 * Edge proxy (Next 16's renamed middleware). Guards app routes:
 *  - valid access token  → continue
 *  - expired access but refresh present → delegate to the Node refresh route,
 *    which rotates tokens then redirects back (DB/Argon work can't run on edge)
 *  - otherwise → redirect to /login
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  if (accessToken && (await verifyAccessToken(accessToken))) {
    return NextResponse.next();
  }

  const hasRefresh = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  const next = encodeURIComponent(pathname + search);

  if (hasRefresh) {
    const url = new URL("/api/auth/refresh", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const loginUrl = new URL(`/login?next=${next}`, request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*"],
};
