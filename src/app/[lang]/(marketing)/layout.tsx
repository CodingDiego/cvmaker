import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { defaultLocale, isLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: {
    default: "CVMaker — Free ATS-friendly resume builder",
    template: "%s · CVMaker",
  },
};

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;

  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<div className="h-14 border-b" />}>
        <SiteHeader locale={locale} />
      </Suspense>
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <MarketingFooter locale={locale} />
    </div>
  );
}
