import type { QueryClient } from "@tanstack/react-query";
import { cvDetailOptions, cvListOptions } from "@/lib/cv/cv-queries";
import { assetListOptions } from "@/lib/assets/asset-queries";
import { sessionListOptions } from "@/lib/auth/session-queries";

/**
 * Maps a destination pathname to the React Query data it needs, so the enhanced
 * <Link> can warm both the route and its data on hover/focus. Add a branch here
 * when a new route has a primary query — the Link picks it up automatically.
 *
 * Returns a promise so callers can ignore rejections; unknown paths resolve to a
 * no-op.
 */
export function prefetchForPath(queryClient: QueryClient, path: string): Promise<unknown> {
  const clean = (path.split("?")[0] ?? "").replace(/\/+$/, "") || "/";

  if (clean === "/dashboard") return queryClient.prefetchQuery(cvListOptions());
  if (clean === "/dashboard/assets") return queryClient.prefetchQuery(assetListOptions());
  if (clean === "/dashboard/sessions") return queryClient.prefetchQuery(sessionListOptions());

  const editor = /^\/editor\/([^/]+)$/.exec(clean);
  if (editor?.[1]) return queryClient.prefetchQuery(cvDetailOptions(editor[1]));

  return Promise.resolve();
}
