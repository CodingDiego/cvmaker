import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<div className="h-14 border-b" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>CVMaker — Free, ATS-friendly resume builder.</p>
      </footer>
    </div>
  );
}
