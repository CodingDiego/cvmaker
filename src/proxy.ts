import { NextResponse, type NextRequest } from "next/server";
import { keepSessionAlive } from "@/lib/auth/session-proxy";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Proxy (Next.js 16's renamed Middleware). Two jobs, both on the Node.js runtime:
 *
 *  1. Locale routing — page requests without a `/en|/es|/pt` prefix are
 *     redirected to the user's preferred locale (cookie → Accept-Language →
 *     default). The choice is mirrored into the NEXT_LOCALE cookie so server-side
 *     redirects to bare paths resolve back to the right locale.
 *  2. Session keep-alive — inline refresh-token rotation for every request
 *     (incl. API/RSC/server actions), so the session stays warm. See
 *     `keepSessionAlive`.
 */

const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;
const HAS_EXTENSION = /\.[^/]+$/;

/** Page routes that participate in locale prefixing (not API/internals/files). */
function isLocalizablePath(pathname: string): boolean {
  return !(
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/.well-known") ||
    HAS_EXTENSION.test(pathname)
  );
}

function pickLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (code && isLocale(code)) return code;
  }
  return defaultLocale;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLocalizablePath(pathname)) {
    const seg = pathname.split("/")[1] ?? "";

    if (!isLocale(seg)) {
      const locale = pickLocale(request);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
      const res = NextResponse.redirect(url);
      res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
      return res;
    }

    // Localized page route: keep the session warm AND sync the locale cookie.
    const res = await keepSessionAlive(request);
    if (request.cookies.get(LOCALE_COOKIE)?.value !== seg) {
      res.cookies.set(LOCALE_COOKIE, seg, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
    }
    return res;
  }

  // API / Next internals / metadata files: session warmth only, no locale work.
  return keepSessionAlive(request);
}

export const config = {
  // Run on every route (incl. API routes, so SPA fetches keep the session warm)
  // EXCEPT static assets, Next internals, Workflow internals, and metadata
  // files. Workflow queue calls must bypass proxy so exports can start.
  //
  // BotID serves its challenge + verification traffic from the fixed, internal
  // prefix `/149e9513-01fa-4fb0-aad4-566afd725d1b/...` (rewritten to Vercel's
  // bot-protection API by `withBotId` in next.config). Middleware runs BEFORE
  // those rewrites, so without this exclusion the locale redirect would rewrite
  // BotID's extension-less POSTs to `/en/149e.../…` and break verification.
  matcher: [
    "/((?!_next/static|_next/image|149e9513-01fa-4fb0-aad4-566afd725d1b/|\\.well-known/workflow/|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
