import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { polarCheckouts } from "@/db/schema";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { syncPolarPlan } from "@/lib/billing/entitlements-server";

export type ApplyCheckoutResult =
  | { ok: true; applied: boolean }
  | {
      ok: false;
      reason:
        | "polar_not_configured"
        | "lookup_failed"
        | "not_paid"
        | "ownership_mismatch"
        | "claimed_by_another_account";
    };

type SessionUser = { id: string; email: string };

/**
 * Redeem a Polar `checkout_id` (from the /success URL) for the signed-in user.
 *
 * Safe to call on every /success render — it's idempotent and guarded:
 *  1. The checkout must be `succeeded` (actually paid).
 *  2. It must belong to this user (external customer id = our user id, or a
 *     matching email) — you can't upgrade your account with someone else's id.
 *  3. The id is claimed in `polar_checkouts` (PK) before granting, so one
 *     checkout upgrades exactly one account exactly once (anti-replay).
 *
 * The webhook remains the source of truth; this just gives instant access on
 * return from checkout instead of waiting for the webhook to land.
 */
export async function applyPolarCheckout(
  checkoutId: string,
  user: SessionUser,
): Promise<ApplyCheckoutResult> {
  if (!env.hasPolar()) return { ok: false, reason: "polar_not_configured" };

  // Fast path: already redeemed.
  const existing = await findCheckout(checkoutId);
  if (existing) {
    return existing.userId === user.id
      ? { ok: true, applied: false }
      : { ok: false, reason: "claimed_by_another_account" };
  }

  let checkout;
  try {
    checkout = await polar.checkouts.get({ id: checkoutId });
  } catch {
    return { ok: false, reason: "lookup_failed" };
  }

  if (checkout.status !== "succeeded") return { ok: false, reason: "not_paid" };

  const ownedByExternalId = checkout.externalCustomerId === user.id;
  const ownedByEmail =
    !!checkout.customerEmail &&
    checkout.customerEmail.trim().toLowerCase() === user.email.trim().toLowerCase();
  if (!ownedByExternalId && !ownedByEmail) {
    return { ok: false, reason: "ownership_mismatch" };
  }

  // Claim the checkout id before granting. If a concurrent request won the
  // race, fall back to the idempotent/ownership check instead of double-granting.
  const claimed = await db
    .insert(polarCheckouts)
    .values({ checkoutId, userId: user.id, status: checkout.status })
    .onConflictDoNothing()
    .returning({ checkoutId: polarCheckouts.checkoutId });

  if (claimed.length === 0) {
    const now = await findCheckout(checkoutId);
    return now?.userId === user.id
      ? { ok: true, applied: false }
      : { ok: false, reason: "claimed_by_another_account" };
  }

  await syncPolarPlan({
    externalId: checkout.externalCustomerId ?? user.id,
    email: checkout.customerEmail ?? user.email,
    customerId: checkout.customerId,
    subscriptionId: checkout.subscriptionId,
    subscriptionStatus: "active",
    active: true,
  });

  return { ok: true, applied: true };
}

async function findCheckout(checkoutId: string) {
  const [row] = await db
    .select({ userId: polarCheckouts.userId })
    .from(polarCheckouts)
    .where(eq(polarCheckouts.checkoutId, checkoutId))
    .limit(1);
  return row ?? null;
}
