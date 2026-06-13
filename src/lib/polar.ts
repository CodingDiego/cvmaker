import "server-only";
import { Polar } from "@polar-sh/sdk";
import { env } from "@/lib/env";

/**
 * Server-side Polar SDK client. Used for anything the route-handler adapters
 * (@polar-sh/nextjs) don't cover — listing products, reading orders, granting
 * benefits manually, etc.
 *
 * The adapters (Checkout/CustomerPortal/Webhooks) take their own `accessToken`
 * and `server` options, so they DON'T import this client. This is for direct
 * API calls from server components / actions.
 */
export const polar = new Polar({
  accessToken: env.polarAccessToken() ?? "",
  server: env.polarServer(),
});

/**
 * Map your app's plans to Polar product IDs. Create the products in the Polar
 * dashboard (sandbox first), then paste their IDs here or set them via env.
 * The checkout route accepts `?products=<id>` so the slug → id mapping lives
 * in your pricing UI; this is just the canonical source.
 */
export const POLAR_PRODUCTS = {
  pro: process.env.POLAR_PRODUCT_PRO ?? "",
} as const;

export type PolarPlan = keyof typeof POLAR_PRODUCTS;
