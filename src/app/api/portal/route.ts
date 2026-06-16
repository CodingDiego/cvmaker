import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * GET /api/portal
 *
 * Sends the logged-in user to their Polar customer portal (manage subscription,
 * payment methods, invoices).
 *
 * We resolve the customer by Polar's OWN id (`users.polarCustomerId`, persisted
 * by `syncPolarPlan`) whenever we have it — that's the reliable handle. We only
 * fall back to OUR user id as the `externalCustomerId` when no Polar id is
 * stored yet. A user can be marked Pro by email match without their Polar
 * customer carrying our external id, so the old external-id-only lookup 422'd
 * ("Customer does not exist") and the adapter crashed the response. Here we
 * catch that and bounce back to billing with a flag instead.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/dashboard/billing", request.url),
    );
  }

  if (!env.hasPolar()) {
    return NextResponse.redirect(
      new URL("/dashboard/billing?portal=unavailable", request.url),
    );
  }

  const [row] = await db
    .select({ polarCustomerId: users.polarCustomerId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const returnUrl = `${env.appUrl()}/dashboard/billing`;

  try {
    const session = row?.polarCustomerId
      ? await polar.customerSessions.create({
          customerId: row.polarCustomerId,
          returnUrl,
        })
      : await polar.customerSessions.create({
          externalCustomerId: user.id,
          returnUrl,
        });

    return NextResponse.redirect(session.customerPortalUrl);
  } catch (error) {
    console.error("[polar] customer portal session failed", {
      userId: user.id,
      hasPolarCustomerId: Boolean(row?.polarCustomerId),
      error,
    });
    return NextResponse.redirect(
      new URL("/dashboard/billing?portal=unavailable", request.url),
    );
  }
}
