import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s · Dashboard",
  },
};

async function RequestTimeMarker() {
  await connection();
  return null;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/dashboard");
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={null}>
        <RequestTimeMarker />
      </Suspense>
      <Suspense fallback={<div className="h-14 border-b" />}>
        <SiteHeader />
      </Suspense>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <aside className="md:sticky md:top-20 md:self-start">
            <DashboardNav />
          </aside>
          <main id="main-content" className="min-w-0" tabIndex={-1}>
            <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
