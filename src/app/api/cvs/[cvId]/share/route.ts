import { getCurrentUser } from "@/lib/auth/session";
import { notFoundJson, unauthorized } from "@/lib/api/response";
import { getShareInfoCached } from "@/lib/cv/cv-reads";

// GET /api/cvs/:cvId/share — public-share state for a CV (share dialog).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cvId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { cvId } = await params;
  const info = await getShareInfoCached(user.id, cvId);
  if (!info) return notFoundJson();
  return Response.json(info);
}
