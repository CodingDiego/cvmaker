import { Suspense } from "react";
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonLd } from "@/components/seo/json-ld";
import { display, geistMono, sans, cvFontVariables } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { organizationLd, siteConfig, softwareApplicationLd, websiteLd } from "@/lib/seo";
import "./globals.css";

const SITE_DESCRIPTION =
  "Create, edit and export ATS-friendly resumes. Start with free templates, then unlock Pro CV designs, live preview, PDF and DOCX export.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "CVMaker - Free ATS-friendly resume builder",
    template: "%s - CVMaker",
  },
  description: SITE_DESCRIPTION,
  applicationName: siteConfig.name,
  keywords: [
    "resume builder",
    "CV maker",
    "ATS-friendly resume",
    "free resume templates",
    "PDF resume",
    "DOCX resume",
    "online CV",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  icons: { icon: "/favicon.ico" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "CVMaker - Free ATS-friendly resume builder",
    description: SITE_DESCRIPTION,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "CVMaker - Free ATS-friendly resume builder",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
          <TooltipProvider>
            <Suspense>{children}</Suspense>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
