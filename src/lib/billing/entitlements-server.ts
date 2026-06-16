import "server-only";
import { cache } from "react";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { BillingPlan } from "@/lib/billing/entitlements";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toBillingPlan(value: string | null | undefined): BillingPlan {
  return value === "pro" ? "pro" : "free";
}

/**
 * Per-request deduplicated (React `cache`): multiple gates in a single render —
 * the template gallery, the editor and export all check the plan — collapse to
 * one query. Keyed by the primitive `userId` so the cache actually hits. The
 * plan only changes via the Polar webhook (a separate request), so deduping
 * within a request never serves a stale value.
 */
export const getUserPlan = cache(async (userId: string): Promise<BillingPlan> => {
  const [row] = await db
    .select({ billingPlan: users.billingPlan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return toBillingPlan(row?.billingPlan);
});

async function findUserForPolarCustomer(input: { externalId?: string | null; email?: string | null }) {
  const filters = [];
  if (input.externalId && UUID_RE.test(input.externalId)) filters.push(eq(users.id, input.externalId));
  if (input.email) filters.push(eq(users.email, input.email.trim().toLowerCase()));
  if (filters.length === 0) return null;

  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(filters.length === 1 ? filters[0]! : or(...filters))
    .limit(1);

  return row ?? null;
}

export async function syncPolarPlan(input: {
  externalId?: string | null;
  email?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  active: boolean;
}) {
  const user = await findUserForPolarCustomer(input);
  if (!user) return { ok: false as const, reason: "user_not_found" as const };

  await db
    .update(users)
    .set({
      billingPlan: input.active ? "pro" : "free",
      polarCustomerId: input.customerId ?? null,
      polarSubscriptionId: input.subscriptionId ?? null,
      polarSubscriptionStatus: input.subscriptionStatus ?? null,
      polarStateSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { ok: true as const, userId: user.id };
}
