import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/response";
import { getExportStatus } from "@/lib/cv/export-service";

// GET /api/exports/:exportId — live export/render status. This is intentionally
// NOT cached (`use cache`): it tracks an in-flight Workflow run and is polled by
// the client every second until it reaches a terminal state.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exportId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { exportId } = await params;
  return Response.json(await getExportStatus(user.id, exportId));
}
