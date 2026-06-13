import { Webhooks } from "@polar-sh/nextjs";
import { env } from "@/lib/env";
import { syncPolarPlan } from "@/lib/billing/entitlements-server";

function firstSubscription(
  subscriptions: Array<{ id?: string | null; status?: string | null }> | undefined,
) {
  return subscriptions?.[0] ?? null;
}

export const POST = Webhooks({
  webhookSecret: env.polarWebhookSecret() ?? "",

  onCustomerStateChanged: async (payload) => {
    const state = payload.data;
    const subscription = firstSubscription(state.activeSubscriptions);
    const result = await syncPolarPlan({
      externalId: state.externalId,
      email: state.email,
      customerId: state.id,
      subscriptionId: subscription?.id,
      subscriptionStatus: subscription?.status,
      active: state.activeSubscriptions.length > 0,
    });

    console.log("[polar] customer.state_changed", {
      synced: result.ok,
      externalId: state.externalId,
      email: state.email,
      activeSubscriptions: state.activeSubscriptions.length,
    });
  },

  onOrderPaid: async (payload) => {
    const order = payload.data;
    const result = await syncPolarPlan({
      externalId: order.customer.externalId,
      email: order.customer.email,
      customerId: order.customer.id,
      subscriptionId: order.subscriptionId,
      subscriptionStatus: order.subscription ? order.subscription.status : "active",
      active: true,
    });

    console.log("[polar] order.paid", {
      synced: result.ok,
      orderId: order.id,
      externalId: order.customer.externalId,
      productId: order.productId,
    });
  },

  onOrderRefunded: async (payload) => {
    console.log("[polar] order.refunded", { orderId: payload.data.id });
  },

  onSubscriptionRevoked: async (payload) => {
    const sub = payload.data;
    const result = await syncPolarPlan({
      externalId: sub.customer.externalId,
      email: sub.customer.email,
      customerId: sub.customer.id,
      subscriptionId: sub.id,
      subscriptionStatus: sub.status,
      active: false,
    });

    console.log("[polar] subscription.revoked", {
      synced: result.ok,
      externalId: sub.customer.externalId,
    });
  },

  onPayload: async (payload) => {
    console.log("[polar] event", payload.type);
  },
});
