import { Link } from "@/components/link";
import { Plus } from "lucide-react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getCvListCached } from "@/lib/cv/cv-reads";
import { Button } from "@/components/ui/button";
import { CvList } from "@/components/dashboard/cv-list";
import { getTFromParams } from "@/i18n/server";

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const [user, t] = await Promise.all([requireUser("/dashboard"), getTFromParams(params)]);

  // Prefetch the list through the same cached read the GET route uses, then
  // hand it to the client via HydrationBoundary — server-rendered, no flash,
  // and the client refetches from /api/cvs on demand.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.cvs.list(),
    queryFn: () => getCvListCached(user.id),
  });

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-semibold">{t("dashboard.cvs.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.cvs.subtitle")}</p>
        </div>
        <Button render={<Link href="/templates" />}>
          <Plus className="size-4" /> {t("dashboard.cvs.newCv")}
        </Button>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CvList />
      </HydrationBoundary>
    </section>
  );
}
