import { type NextRequest } from "next/server";
import { keepSessionAlive } from "@/lib/auth/session-proxy";

/**
 * Proxy (Next.js 16's renamed Middleware). One job, on the Node.js runtime:
 * keep the session warm via inline refresh-token rotation for every request
 * (incl. API/RSC/server actions). See `keepSessionAlive`.
 *
 * Locale routing is NOT handled here anymore — it lives entirely in
 * `next.config.ts` (`rewrites()` maps the locale subdomain → the `[lang]`
 * segment, `redirects()` sends the apex to the English subdomain). The proxy
 * sees the original host (`es.free-cv.com`) and the bare path (`/templates`),
 * and ignores both.
 */
export default async function proxy(request: NextRequest) {
  return keepSessionAlive(request);
}

export const config = {
  // Run on every route (incl. API routes, so SPA fetches keep the session warm)
  // EXCEPT static assets, Next internals, Workflow internals, and metadata
  // files. Workflow queue calls must bypass proxy so exports can start.
  //
  // Machine-to-machine endpoints are also excluded: cron (`/api/cron/*`, secured
  // by the Vercel `CRON_SECRET` bearer) and provider webhooks (`/api/webhooks/*`,
  // secured by signature). They carry no user session, so running session
  // rotation/cookie logic on them is pure overhead — and forwarding their
  // request through the proxy must never interfere with their own auth.
  //
  // BotID serves its challenge + verification traffic from the fixed, internal
  // prefix `/149e9513-01fa-4fb0-aad4-566afd725d1b/...` (rewritten to Vercel's
  // bot-protection API by `withBotId` in next.config). It must stay excluded so
  // the proxy never attaches session cookies to — or otherwise interferes with —
  // BotID's extension-less verification POSTs.
  matcher: [
    "/((?!_next/static|_next/image|api/cron/|api/webhooks/|149e9513-01fa-4fb0-aad4-566afd725d1b/|\\.well-known/workflow/|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
