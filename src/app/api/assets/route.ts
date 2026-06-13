import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/response";
import { getAssetListCached } from "@/lib/assets/asset-reads";

// GET /api/assets — the current user's asset list.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return Response.json(await getAssetListCached(user.id));
}
