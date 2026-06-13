import { CustomerPortal } from "@polar-sh/nextjs";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * GET /api/portal
 *
 * Sends the logged-in user to their Polar customer portal (manage subscription,
 * payment methods, invoices). We use `getExternalCustomerId` so Polar resolves
 * the customer by OUR user id — the same id we passed as `customerExternalId`
 * at checkout — instead of requiring us to store Polar's customer id.
 */
export const GET = CustomerPortal({
  accessToken: env.polarAccessToken() ?? "",
  server: env.polarServer(),
  getExternalCustomerId: async (_req: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/dashboard/billing");
    return user.id;
  },
});
