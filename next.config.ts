import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";
import { withBotId } from 'botid/next/config';

// Resolve the `@premium` import. Premium designs live in the private `/.premium`
// overlay (git-ignored, its own repo). When present (local dev / private deploy)
// the real designs are merged into the template registry; otherwise the
// open-source build falls back to an empty stub. This keeps premium code out of
// the public repo entirely while letting both builds compile cleanly.
const hasPremiumOverlay = existsSync(path.join(process.cwd(), ".premium", "index.ts"));
const premiumAlias = hasPremiumOverlay
  ? "./.premium/index.ts"
  : "./src/templates/premium-empty.ts";
// Server-only export renderers for premium designs (kept out of client bundles).
const premiumRenderAlias = hasPremiumOverlay
  ? "./.premium/render.ts"
  : "./src/templates/premium-render-empty.ts";

// Strong Content-Security-Policy + hardening headers for free-cv.com.
// Notes:
//  - script/style use 'unsafe-inline': Next's App Router injects inline
//    bootstrap without a nonce, and base-ui/Tailwind/the resume renderer emit
//    inline styles. Every other directive is locked down.
//  - img allows data:/blob: (resume photos are data URLs) + the public Blob
//    store (shared PDF/DOCX/preview assets).
//  - Polar checkout is a top-level redirect (not framed), so it only needs
//    form-action, not frame-src.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://polar.sh https://sandbox.polar.sh https://buy.polar.sh",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.public.blob.vercel-storage.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// --- Subdomain-based localization ------------------------------------------
// Locale lives in the HOST, not the URL path: `en|es|pt.<root>` is rewritten to
// the internal `/en|/es|/pt` segment (the `app/[lang]` tree is unchanged). This
// keeps the `[lang]` prefix out of every visible URL and moves all locale
// routing out of the proxy and into the platform. The apex/www redirect to the
// English subdomain in production (see `redirects()`).
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "free-cv.com";

/** Strip protocol/path from a host value and regex-escape it (null if empty). */
function escapeHost(host?: string): string | null {
  if (!host) return null;
  return host
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Every host a locale subdomain may sit in front of: the production root domain,
// the Vercel-generated URLs (for preview/branch deploys), and localhost for dev.
const domainPattern = [
  escapeHost(ROOT_DOMAIN),
  escapeHost(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  escapeHost(process.env.VERCEL_BRANCH_URL),
  escapeHost(process.env.VERCEL_URL),
  "localhost(?::\\d+)?",
]
  .filter(Boolean)
  .join("|");

// Negative lookahead for paths that must NEVER receive a locale prefix — they
// have no `[lang]` counterpart and must fall through to the filesystem as-is:
// API routes, Next/Vercel internals, BotID's fixed challenge prefix, well-known
// endpoints, metadata files and any static asset (matched by extension). Mirrors
// `isLocalizablePath` + the proxy matcher so all three agree on "what is a page".
const NON_PAGE_PATH =
  "(?!api/|_next/|_vercel/|149e9513-01fa-4fb0-aad4-566afd725d1b/|\\.well-known/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|llms\\.txt|opengraph\\.png|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|woff2?|map)$)";

// One explicit rule per locale (NOT a wildcard capture): the `[lang]` param set
// is closed (en/es/pt) and must match `generateStaticParams` 1:1, so an unknown
// subdomain must never inject a stray segment and break cacheComponents prerender.
function localeRewrite(locale: string) {
  return {
    source: `/:path(${NON_PAGE_PATH}.*)*`,
    has: [{ type: "host" as const, value: `^${locale}\\.(?:${domainPattern})$` }],
    destination: `/${locale}/:path*`,
  };
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    typedEnv: true,
    // Enables app/global-not-found.tsx: a consistent 404 for unmatched URLs.
    // Required because the root layout lives in the [lang] dynamic segment, so a
    // 404 can't be composed from a static root layout + not-found.
    globalNotFound: true,
  },
  serverExternalPackages: ["@node-rs/argon2", "@react-pdf/renderer"],
  turbopack: {
    resolveAlias: {
      "@premium": premiumAlias,
      "@premium/render": premiumRenderAlias,
    },
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return {
      // `beforeFiles` runs after the proxy but before the filesystem check, so we
      // can inject the `[lang]` segment for a path that only exists under
      // `app/[lang]` (there is no top-level `app/templates`). Each locale host
      // maps to its segment; any host WITHOUT a locale subdomain (bare localhost,
      // `*.vercel.app` previews) falls through to the English default. The apex
      // in production is handled by `redirects()` below before reaching here.
      beforeFiles: [
        localeRewrite("en"),
        localeRewrite("es"),
        localeRewrite("pt"),
        // Fallback → English for hosts WITHOUT a locale subdomain (bare
        // localhost, `*.vercel.app` previews). The host guard is ESSENTIAL:
        // `beforeFiles` rules CHAIN (each is tested against the running path, no
        // early exit), so an unguarded fallback re-fires on the output of the
        // locale rules above (`en.host/` → `/en` → `/en/en` → 404). Restricting
        // it to non-locale hosts stops the double-prefix.
        {
          source: `/:path(${NON_PAGE_PATH}.*)*`,
          has: [{ type: "host", value: "^(?!(?:en|es|pt)\\.).+$" }],
          destination: "/en/:path*",
        },
      ],
    };
  },
  async redirects() {
    // Production only: consolidate the apex (and www) onto the English subdomain
    // with a single static 308 — no per-request language detection. Previews and
    // dev have no apex to redirect, and a cached redirect there is a nuisance.
    if (process.env.VERCEL_ENV !== "production") return [];
    const root = escapeHost(ROOT_DOMAIN);
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `^(?:www\\.)?${root}$` }],
        destination: `https://en.${ROOT_DOMAIN}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default withWorkflow(withBotId(nextConfig));
