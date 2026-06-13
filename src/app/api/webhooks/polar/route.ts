import { Webhooks } from "@polar-sh/nextjs";
import { env } from "@/lib/env";

/**
 * POST /api/webhooks/polar
 *
 * Polar calls this on every billing event. The adapter verifies the
 * standard-webhooks signature (webhook-id / webhook-timestamp / webhook-signature
 * headers) against POLAR_WEBHOOK_SECRET and returns 403 on mismatch BEFORE any
 * callback runs — so the bodies below only ever see authenticated events.
 *
 * Entitlement model (what to listen to):
 *   • customer.state_changed → SOURCE OF TRUTH. Polar recommends this single
 *     event for access control: it carries the customer's CURRENT state
 *     (activeSubscriptions + grantedBenefits), so you just reconcile the user's
 *     plan from it instead of tracking every transition by hand.
 *   • order.paid            → a payment cleared (one-time purchase or a renewal).
 *                              Use it to record payments / send receipts.
 *   • order.refunded        → reverse whatever the order granted.
 *   • subscription.revoked  → explicit "access ended" (belt-and-suspenders; the
 *                              state_changed event also reflects this).
 *
 * Map events to a local user by `externalId` (the user.id we stamped at
 * checkout), falling back to `email`. Make every handler idempotent — Polar
 * retries on any non-2xx and may deliver the same event more than once.
 *
 * This route MUST stay outside the auth proxy matcher (proxy.ts only guards
 * /dashboard and /editor) and must read the raw body — the adapter does both.
 */
export const POST = Webhooks({
  webhookSecret: env.polarWebhookSecret() ?? "",

  // ── Primary: reconcile entitlement from the customer's full current state ──
  onCustomerStateChanged: async (payload) => {
    const state = payload.data;
    const isActive = state.activeSubscriptions.length > 0;
    console.log("[polar] customer.state_changed", {
      externalId: state.externalId,
      email: state.email,
      activeSubscriptions: state.activeSubscriptions.length,
      grantedBenefits: state.grantedBenefits.length,
    });
    // TODO: find the user by state.externalId (fallback state.email) and set
    // their plan = isActive ? "pro" : "free". This one handler covers
    // activate / renew / cancel-at-period-end / revoke transitions.
    void isActive;
  },

  // ── Payments (receipts, one-time purchases, renewals) ──
  onOrderPaid: async (payload) => {
    const order = payload.data;
    console.log("[polar] order.paid", {
      orderId: order.id,
      externalId: order.customer.externalId,
      productId: order.productId,
      amount: order.totalAmount,
    });
    // TODO: record the payment; for one-time products, grant the purchase here.
  },

  onOrderRefunded: async (payload) => {
    const order = payload.data;
    console.log("[polar] order.refunded", { orderId: order.id });
    // TODO: reverse whatever this order granted.
  },

  // ── Explicit revoke (state_changed also covers this) ──
  onSubscriptionRevoked: async (payload) => {
    const sub = payload.data;
    console.log("[polar] subscription.revoked", {
      externalId: sub.customer.externalId,
    });
    // TODO: downgrade the user to the free plan.
  },

  // ── Catch-all: log every event type (handy during development) ──
  onPayload: async (payload) => {
    console.log("[polar] event", payload.type);
  },
});
