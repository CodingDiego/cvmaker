import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonLd } from "@/components/seo/json-ld";
import { display, geistMono, sans, cvFontVariables } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { organizationLd, siteConfig, softwareApplicationLd, websiteLd } from "@/lib/seo";
import { I18nProvider } from "@/i18n/provider";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next"

const SITE_DESCRIPTION =
  "Create a professional, ATS-friendly CV for free. Pick a modern template, edit with live preview, and download as PDF or DOCX in minutes — no watermarks.";

const OG_IMAGE = {
  url: "/opengraph.png",
  width: 1731,
  height: 909,
  alt: "CVMaker - Free ATS-friendly resume builder",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Free CV Maker – ATS-Friendly Resume Builder | CVMaker",
    template: "%s · CVMaker",
  },
  description: SITE_DESCRIPTION,
  applicationName: siteConfig.name,
  keywords: [
    "free cv maker",
    "cv maker",
    "free resume builder",
    "resume builder",
    "ATS-friendly resume",
    "free cv templates",
    "online cv",
    "PDF resume",
    "DOCX resume",
    "cv maker gratis",
    "plantillas de cv gratis",
    "crear cv online",
    "criar currículo grátis",
    "currículo online",
    "modelos de currículo",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
    languages: { en: "/en", es: "/es", pt: "/pt", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    siteName: "CVMaker · free-cv.com",
    title: "Free CV Maker – ATS-Friendly Resume Builder | CVMaker",
    description: SITE_DESCRIPTION,
    url: siteConfig.url,
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free CV Maker – ATS-Friendly Resume Builder | CVMaker",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcf7" },
    { media: "(prefers-color-scheme: dark)", color: "#081113" },
  ],
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const messages = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${sans.variable} ${display.variable} ${geistMono.variable} ${cvFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <JsonLd id="organization-json-ld" data={organizationLd()} />
        <JsonLd id="website-json-ld" data={websiteLd()} />
        <JsonLd id="software-json-ld" data={softwareApplicationLd()} />
        <Providers>
          <I18nProvider locale={lang} messages={messages}>
            <TooltipProvider>
              <Suspense>
                {children}
                <Analytics />
              </Suspense>
            </TooltipProvider>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
