import { getCurrentUser } from "@/lib/auth/session";
import { notFoundJson, unauthorized } from "@/lib/api/response";
import { getCvDetailCached } from "@/lib/cv/cv-reads";

// GET /api/cvs/:cvId — a single CV document (seeds the editor store on the client).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cvId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { cvId } = await params;
  const cv = await getCvDetailCached(user.id, cvId);
  if (!cv) return notFoundJson();
  return Response.json(cv);
}
