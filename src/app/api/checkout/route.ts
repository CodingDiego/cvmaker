import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * GET /api/checkout
 *
 * We use a **Polar Checkout Link** (a persistent URL configured in the Polar
 * dashboard — that's where the Success URL, Return URL and "require billing
 * address" live). This route is a thin redirect that stamps the *logged-in*
 * user onto the checkout so the webhook can map the resulting order/subscription
 * back to our user:
 *
 *   - `customer_external_id` = our `user.id`  → arrives as `customer.externalId`
 *   - `customer_email`       = our `user.email` (prefills + reliable fallback)
 *
 * Anonymous visitors are sent straight to the link (Polar collects their email,
 * and we reconcile by email in the webhook).
 *
 * Point your pricing button at `/api/checkout` instead of hardcoding the Polar
 * URL, so identity is always attached.
 */
export async function GET(_req: NextRequest) {
  const link = env.polarCheckoutLink();
  if (!link) {
    return NextResponse.json(
      { error: "POLAR_CHECKOUT_LINK is not configured" },
      { status: 503 },
    );
  }

  const target = new URL(link);
  const user = await getCurrentUser();
  if (user) {
    target.searchParams.set("customer_external_id", user.id);
    target.searchParams.set("customer_email", user.email);
  }

  return NextResponse.redirect(target.toString());
}
