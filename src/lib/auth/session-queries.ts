/**
 * Client-facing query layer for the active-sessions list.
 *
 * `current` (whether a row is the viewer's own session) depends on the request,
 * not just the user, so it is NOT part of the cached read — the GET route and
 * the server prefetch stamp it on per request before the data reaches here.
 */
import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchJson } from "@/lib/query/fetch";

/** A session row without the per-request `current` flag (the cached shape). */
export interface SessionBase {
  id: string;
  deviceLabel: string | null;
  ip: string | null;
  environment: "prod" | "preview" | "local";
  lastActiveAt: string;
}

export type SessionView = SessionBase & { current: boolean };

export function sessionListOptions() {
  return queryOptions({
    queryKey: queryKeys.sessions.list(),
    queryFn: () => fetchJson<SessionView[]>("/api/sessions"),
    // Sessions change out-of-band (logins, token rotation, revokes elsewhere),
    // so always show the live list: treat cached data as stale and refetch when
    // the panel mounts or the tab regains focus.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
