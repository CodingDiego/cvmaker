import { type NextRequest } from "next/server";
import { keepSessionAlive } from "@/lib/auth/session-proxy";

/**
 * Proxy (Next.js 16's renamed Middleware). Runs on the Node.js runtime, so it
 * can do real refresh-token rotation against the database — but it only does so
 * when the short-lived access token has actually expired; the common case is a
 * networkless JWT verify with no DB round-trip.
 *
 * Unlike a redirect-based "handshake", refresh happens inline: the new token is
 * forwarded to the current render and written to the response in one pass. This
 * works for document navigations, RSC requests, server actions, and `fetch()`
 * calls alike (a fetch can't follow an HTML redirect to a refresh endpoint).
 * See `keepSessionAlive` for the full strategy.
 */
export default function proxy(request: NextRequest) {
  return keepSessionAlive(request);
}

export const config = {
  // Run on every route (incl. API routes, so SPA fetches keep the session warm)
  // EXCEPT static assets, Next internals, and metadata files. For auth, running
  // on all routes is the recommended posture.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
