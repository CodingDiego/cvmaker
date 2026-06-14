import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { env } from "@/lib/env";
import { polar } from "@/lib/polar";
import { syncPolarPlan } from "@/lib/billing/entitlements-server";

/**
 * Daily billing reconciliation (Vercel Cron). The webhook is the primary path;
 * this is the safety net for missed/lost events: it re-checks every Pro user's
 * subscription against Polar and downgrades anyone whose subscription is no
 * longer active. Secured by the `CRON_SECRET` bearer token Vercel sends.
 */
export async function GET(request: NextRequest) {
  const secret = env.cronSecret();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.hasPolar()) {
    return NextResponse.json({ ok: true, skipped: "polar_not_configured" });
  }

  const proUsers = await db
    .select({
      id: users.id,
      email: users.email,
      customerId: users.polarCustomerId,
      subscriptionId: users.polarSubscriptionId,
    })
    .from(users)
    .where(eq(users.billingPlan, "pro"));

  let checked = 0;
  let downgraded = 0;
  let errors = 0;

  for (const u of proUsers) {
    checked++;
    if (!u.subscriptionId) continue;
    try {
      const sub = await polar.subscriptions.get({ id: u.subscriptionId });
      const active = sub.status === "active" || sub.status === "trialing";
      if (!active) {
        await syncPolarPlan({
          externalId: u.id,
          email: u.email,
          customerId: u.customerId,
          subscriptionId: u.subscriptionId,
          subscriptionStatus: sub.status,
          active: false,
        });
        downgraded++;
      }
    } catch {
      // Leave the user as-is on a transient lookup error; the webhook and the
      // next run will reconcile.
      errors++;
    }
  }

  return NextResponse.json({ ok: true, checked, downgraded, errors });
}
