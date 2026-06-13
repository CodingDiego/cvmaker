/**
 * Client-facing query layer for the assets domain. `AssetView` is the
 * serializable shape produced by the GET route (and the server prefetch
 * mapper), consumed by `useQuery` in the asset manager.
 */
import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchJson } from "@/lib/query/fetch";

export interface AssetView {
  id: string;
  name: string;
  contentType: string;
  shared: boolean;
  publicUrl: string | null;
  syncing: boolean;
}

export function assetListOptions() {
  return queryOptions({
    queryKey: queryKeys.assets.list(),
    queryFn: () => fetchJson<AssetView[]>("/api/assets"),
  });
}
