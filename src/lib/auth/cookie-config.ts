/**
 * Auth cookie names + attributes, shared by every layer that issues them:
 * Server Actions / Route Handlers via `next/headers` (see `cookies.ts`) and the
 * Proxy via `NextResponse.cookies` (see `session-proxy.ts`). Kept free of
 * `server-only` and `next/headers` so it can be imported from the proxy module.
 *
 * The cookie descriptors returned here are plain objects accepted by both
 * `cookieStore.set(obj)` and `response.cookies.set(obj)`, guaranteeing the two
 * code paths emit byte-identical cookies.
 */

export const ACCESS_COOKIE = "cv_at";
export const REFRESH_COOKIE = "cv_rt";

// Access token lives 15 min; the proxy slides it forward off the refresh token.
export const ACCESS_MAX_AGE = 15 * 60;
// Refresh token (rotating) lives 30 days — the effective "stay signed in" window.
export const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

export interface CookieDescriptor {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
}

function base() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export function accessCookie(value: string): CookieDescriptor {
  return { name: ACCESS_COOKIE, value, ...base(), maxAge: ACCESS_MAX_AGE };
}

export function refreshCookie(value: string): CookieDescriptor {
  return { name: REFRESH_COOKIE, value, ...base(), maxAge: REFRESH_MAX_AGE };
}

/** A descriptor that expires the cookie immediately (logout / failed refresh). */
export function clearedCookie(name: string): CookieDescriptor {
  return { name, value: "", ...base(), maxAge: 0 };
}
