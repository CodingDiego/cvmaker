import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookie,
  refreshCookie,
  clearedCookie,
} from "./cookie-config";
import { verifyAccessToken, signAccessToken } from "./jwt";
import { rotateRefresh } from "./sessions";
import { describeRequest } from "./device";

/**
 * The hybrid session keeper, invoked from the Proxy on (nearly) every request.
 *
 * Hot path: a still-valid access token is verified networklessly with `jose`
 * (no DB round-trip) — this is the case for the overwhelming majority of
 * requests. Only once the 15-minute access token has expired do we touch the
 * database to rotate the long-lived refresh token and slide a fresh access
 * token forward, the same way Clerk keeps a short-lived token alive off a
 * durable session.
 *
 * When a refresh happens we both (a) forward the new access token on the
 * *request* so the current render / route handler / server action sees the user
 * as authenticated immediately, and (b) write the cookies on the *response* so
 * the browser persists them for subsequent requests.
 *
 * Authorization is deliberately NOT enforced here — that stays in the Data
 * Access Layer (`requireUser`), as the framework recommends. The proxy only
 * keeps the session warm.
 */
export async function keepSessionAlive(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // Fast path: valid access token → nothing to do, no DB hit.
  if (accessToken && (await verifyAccessToken(accessToken))) {
    return NextResponse.next();
  }

  // No refresh token → anonymous (or fully expired). Let the DAL handle authz;
  // the proxy never redirects.
  if (!refreshToken) {
    // If a stale access cookie lingers without a refresh token, drop it.
    if (accessToken) {
      const res = NextResponse.next();
      res.cookies.set(clearedCookie(ACCESS_COOKIE));
      return res;
    }
    return NextResponse.next();
  }

  const ctx = describeRequest(request.headers);
  const result = await rotateRefresh(refreshToken, ctx);

  if (!result) {
    // Invalid / expired / reused refresh token → clear both cookies so the user
    // re-authenticates cleanly instead of looping on a dead session.
    const res = NextResponse.next();
    res.cookies.set(clearedCookie(ACCESS_COOKIE));
    res.cookies.set(clearedCookie(REFRESH_COOKIE));
    return res;
  }

  const freshAccess = await signAccessToken({
    userId: result.user.id,
    sessionId: result.sessionId,
    email: result.user.email,
    name: result.user.name,
  });

  // Make the new access token visible to the current render by forwarding it on
  // the request, then persist it on the response.
  request.cookies.set(ACCESS_COOKIE, freshAccess);
  const res = NextResponse.next({ request: { headers: request.headers } });
  res.cookies.set(accessCookie(freshAccess));

  // Only the request that actually won the rotation writes the refresh cookie;
  // grace-window revalidations leave it to that sibling to avoid clobbering it.
  if (result.kind === "rotated") {
    res.cookies.set(refreshCookie(result.refreshToken));
  }

  return res;
}
