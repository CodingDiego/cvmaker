import { Suspense } from "react";
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { display, geistMono, sans, cvFontVariables } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import "./globals.css";

const SITE_NAME = "CVMaker";
const SITE_URL = "https://free-cv.com";
const SITE_DESCRIPTION =
  "Create, edit and export ATS-friendly resumes. Start with free templates, then unlock Pro CV designs, live preview, PDF and DOCX export.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CVMaker - Free ATS-friendly resume builder",
    template: "%s - CVMaker",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "resume builder",
    "CV maker",
    "ATS-friendly resume",
    "free resume templates",
    "PDF resume",
    "DOCX resume",
    "online CV",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  icons: { icon: "/favicon.ico" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "CVMaker - Free ATS-friendly resume builder",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
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
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${geistMono.variable} ${cvFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TooltipProvider>
            <Suspense>{children}</Suspense>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
