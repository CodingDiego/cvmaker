import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { sans, display, geistMono, cvFontVariables } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "CVMaker — Free ATS-friendly resume builder",
    template: "%s · CVMaker",
  },
  description:
    "Create, edit and export ATS-friendly resumes for free. 10 professional templates, live preview, and export to PDF, DOCX or all formats at once.",
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
            <Suspense fallback={null}>{children}</Suspense>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
