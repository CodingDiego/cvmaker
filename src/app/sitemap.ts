import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Public, indexable routes only. Authed app routes (/dashboard, /editor) and
// API routes are intentionally excluded (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "templates", priority: 0.9, changeFrequency: "weekly" },
    { path: "login", priority: 0.5, changeFrequency: "monthly" },
    { path: "register", priority: 0.6, changeFrequency: "monthly" },
    { path: "terms", priority: 0.3, changeFrequency: "monthly" },
    { path: "privacy", priority: 0.3, changeFrequency: "monthly" },
  ];

  return entries.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  }));
}
