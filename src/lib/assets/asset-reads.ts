import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import type { Asset } from "@/db/schema";
import { listAssets } from "./service";
import type { AssetView } from "./asset-queries";

function toAssetView(a: Asset): AssetView {
  return {
    id: a.id,
    name: a.name,
    contentType: a.contentType,
    shared: a.shared,
    publicUrl: a.publicUrl,
    syncing: Boolean(a.syncRunId),
  };
}

export async function getAssetListCached(userId: string): Promise<AssetView[]> {
  "use cache";
  cacheTag(tags.assetList(userId));
  cacheLife("hours");
  const rows = await listAssets(userId);
  return rows.map(toAssetView);
}
