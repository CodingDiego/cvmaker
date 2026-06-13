import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private app surfaces and APIs out of the index.
      disallow: ["/dashboard", "/editor", "/api/", "/verify", "/reset"],
    },
    sitemap: absoluteUrl("sitemap.xml"),
    host: siteHost(),
  };
}

function siteHost(): string {
  return absoluteUrl();
}
