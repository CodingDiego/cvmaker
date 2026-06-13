import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import "./globals.css";
import { sans, display, geistMono, cvFontVariables } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "CVMaker — Free ATS-friendly resume builder",
    template: "%s · CVMaker",
  },
  description: siteConfig.description,
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
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "CVMaker — Free ATS-friendly resume builder",
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "CVMaker — Free ATS-friendly resume builder",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

async function ConnectionMarker() {
  await connection();
  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${geistMono.variable} ${cvFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ConnectionMarker />
        </Suspense>
        <Providers>
          <TooltipProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
