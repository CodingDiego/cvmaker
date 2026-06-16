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
    },
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withWorkflow(withBotId(nextConfig));
