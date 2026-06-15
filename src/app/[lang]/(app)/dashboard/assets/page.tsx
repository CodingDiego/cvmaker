import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getAssetListCached } from "@/lib/assets/asset-reads";
import { AssetManager } from "@/components/dashboard/asset-manager";

export default async function AssetsPage() {
  const user = await requireUser("/dashboard/assets");

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: () => getAssetListCached(user.id),
  });

  return (
    <section aria-labelledby="assets-title" className="space-y-6">
      <header>
        <h1 id="assets-title" className="text-2xl font-semibold">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Files live in a private store. Toggle sharing to publish a synced copy to the public
          store; every update re-syncs automatically.
        </p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AssetManager />
      </HydrationBoundary>
    </section>
  );
}
