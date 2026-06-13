import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/response";
import { getSessionListCached, withCurrent } from "@/lib/auth/session-reads";

// GET /api/sessions — the current user's active sessions, with the viewer's own
// session flagged (`current`). The list itself is cached per user; `current` is
// applied per request from the access-token claims.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const rows = await getSessionListCached(user.id);
  return Response.json(withCurrent(rows, user.sessionId));
}
