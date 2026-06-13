import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import type { Session } from "@/db/schema";
import { listActiveSessions } from "./sessions";
import type { SessionBase, SessionView } from "./session-queries";

function toSessionBase(s: Session): SessionBase {
  return {
    id: s.id,
    deviceLabel: s.deviceLabel,
    ip: s.ip,
    environment: s.environment,
    lastActiveAt: s.lastActiveAt.toISOString(),
  };
}

/** Cached, per-user (no `current` — that's stamped per request). */
export async function getSessionListCached(userId: string): Promise<SessionBase[]> {
  "use cache";
  cacheTag(tags.sessionList(userId));
  cacheLife("hours");
  const rows = await listActiveSessions(userId);
  return rows.map(toSessionBase);
}

/** Stamp the per-request `current` flag onto the cached rows. */
export function withCurrent(
  rows: SessionBase[],
  currentSessionId: string,
): SessionView[] {
  return rows.map((s) => ({ ...s, current: s.id === currentSessionId }));
}
