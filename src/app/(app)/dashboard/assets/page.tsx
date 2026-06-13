import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getAssetListCached } from "@/lib/assets/asset-reads";
import { AssetManager } from "@/components/dashboard/asset-manager";

export const metadata: Metadata = { title: "Assets" };

export default async function AssetsPage() {
  const user = await requireUser("/dashboard/assets");

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: () => getAssetListCached(user.id),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Files live in a private store. Toggle sharing to publish a synced copy to the public
          store; every update re-syncs automatically.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AssetManager />
      </HydrationBoundary>
    </div>
  );
}
