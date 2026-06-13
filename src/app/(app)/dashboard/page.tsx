import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getCvListCached } from "@/lib/cv/cv-reads";
import { Button } from "@/components/ui/button";
import { CvList } from "@/components/dashboard/cv-list";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");

  // Prefetch the list through the same cached read the GET route uses, then
  // hand it to the client via HydrationBoundary — server-rendered, no flash,
  // and the client refetches from /api/cvs on demand.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.cvs.list(),
    queryFn: () => getCvListCached(user.id),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My CVs</h1>
          <p className="text-sm text-muted-foreground">Create, edit and export your resumes.</p>
        </div>
        <Button render={<Link href="/templates" />}>
          <Plus className="size-4" /> New CV
        </Button>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CvList />
      </HydrationBoundary>
    </div>
  );
}
