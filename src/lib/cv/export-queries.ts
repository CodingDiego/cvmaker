/**
 * Client-facing query layer for export status. The status is live workflow
 * state, so the query polls (via `refetchInterval` in the consumer) rather than
 * being cached server-side.
 */
import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchJson } from "@/lib/query/fetch";
import type { ExportStatus } from "./export-service";

export type { ExportStatus };

export function exportStatusOptions(exportId: string | null) {
  return queryOptions({
    queryKey: queryKeys.exports.detail(exportId ?? "none"),
    queryFn: () => fetchJson<ExportStatus | null>(`/api/exports/${exportId}`),
    enabled: !!exportId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "done" || s === "error" ? false : 1000;
    },
  });
}
