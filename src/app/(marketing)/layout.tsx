import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { MarketingFooter } from "@/components/marketing-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<div className="h-14 border-b" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
