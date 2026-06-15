import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

/**
 * Web App Manifest, generated so it stays in sync with the central SEO config
 * and the icons shipped in `/public`. Served by Next at `/manifest.webmanifest`
 * (the `<link rel="manifest">` tag is injected automatically) — this replaces
 * the hand-written `public/site.webmanifest`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CVMaker - Free ATS-friendly resume builder",
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fdfcf7",
    theme_color: "#007d5c",
    categories: ["productivity", "business", "utilities"],
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
