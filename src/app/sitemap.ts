import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { locales } from "@/i18n/config";

// Public, indexable routes only. Authed app routes (/dashboard, /editor) and
// API routes are intentionally excluded (see robots.ts). Each route is emitted
// once per locale with hreflang alternates pointing at its siblings.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "templates", priority: 0.9, changeFrequency: "weekly" },
    { path: "register", priority: 0.6, changeFrequency: "monthly" },
    { path: "terms", priority: 0.3, changeFrequency: "monthly" },
    { path: "privacy", priority: 0.3, changeFrequency: "monthly" },
  ];

  const localized = (locale: string, path: string) => absoluteUrl(path ? `${locale}/${path}` : locale);

  return entries.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: localized(locale, path),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, localized(l, path)])),
      },
    })),
  );
}
