import "server-only";
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

/**
 * The active-session list (no `current` — that's stamped per request).
 *
 * Deliberately NOT wrapped in `use cache`: the list changes on every login and
 * on every refresh-token rotation (which updates `lastActiveAt`), and those
 * writes happen in the Proxy where `updateTag` isn't available. A stale,
 * hours-long cache made revoked/rotated sessions linger in the panel, so we read
 * straight from the DB — the list is tiny and per-user, so it's cheap.
 */
export async function getSessionList(userId: string): Promise<SessionBase[]> {
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
