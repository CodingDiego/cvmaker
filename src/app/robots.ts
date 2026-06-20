import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { siteConfig } from "@/lib/seo";

// Locale lives in the host (`en|es|pt.<root>`), and this file is served as-is on
// every subdomain (it's excluded from the locale rewrite). So `robots.txt` is
// made per-host: each locale subdomain advertises ITS OWN sitemap + host, which
// keeps each one self-consistent with its per-locale canonical (declaring the
// English host on `es.`/`pt.` would contradict their self-canonicalization).
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await requestOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private app surfaces and APIs out of the index.
      disallow: ["/dashboard", "/editor", "/api/", "/verify", "/reset", "/success", "/return"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

/**
 * Origin of the incoming request (`https://es.free-cv.com`), derived from the
 * forwarded host/proto headers. Reading headers opts this route into dynamic
 * rendering so each subdomain gets its own robots.txt. Falls back to the
 * canonical site URL when no host header is present.
 */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteConfig.url;
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
