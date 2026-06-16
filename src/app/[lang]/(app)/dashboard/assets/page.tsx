import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getAssetListCached } from "@/lib/assets/asset-reads";
import { AssetManager } from "@/components/dashboard/asset-manager";
import { getTFromParams } from "@/i18n/server";

export default async function AssetsPage({ params }: { params: Promise<{ lang: string }> }) {
  const [user, t] = await Promise.all([requireUser("/dashboard/assets"), getTFromParams(params)]);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: () => getAssetListCached(user.id),
  });

  return (
    <section aria-labelledby="assets-title" className="space-y-6">
      <header>
        <h1 id="assets-title" className="text-2xl font-semibold">{t("dashboard.assets.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.assets.subtitle")}</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AssetManager />
      </HydrationBoundary>
    </section>
  );
}
