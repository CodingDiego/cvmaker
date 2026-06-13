import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/response";
import { getCvListCached } from "@/lib/cv/cv-reads";

// GET /api/cvs — the current user's CV list. Reads are cached via `use cache`
// inside getCvListCached (keyed + tagged per user); mutations invalidate with
// updateTag, so this route always reflects the latest writes.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return Response.json(await getCvListCached(user.id));
}
