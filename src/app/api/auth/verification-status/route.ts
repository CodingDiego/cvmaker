import { getCurrentUser } from "@/lib/auth/session";
import { buildVerificationStatus } from "@/lib/auth/verification-status";

export async function GET() {
  const user = await getCurrentUser();

  return Response.json(buildVerificationStatus(user), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
