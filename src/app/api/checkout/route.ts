import { NextRequest, NextResponse } from "next/server";
import { polar, POLAR_PRODUCTS } from "@/lib/polar";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Dynamic Polar checkout via the SDK (`polar.checkouts.create`).
 *
 * Unlike a static Checkout Link, this creates a fresh checkout session per
 * request and stamps the signed-in user's identity onto it server-side, so the
 * buyer can never spoof which account gets upgraded. We redirect to the hosted
 * checkout URL Polar returns.
 *
 * The product can be overridden with `?products=<id>` (one or more); it defaults
 * to the Pro plan. `successUrl` carries the `{CHECKOUT_ID}` placeholder that
 * Polar substitutes on return, which `/success` redeems for instant access.
 */
export async function GET(request: NextRequest) {
  if (!env.hasPolar()) {
    return NextResponse.json(
      { error: "POLAR_ACCESS_TOKEN is not configured" },
      { status: 503 },
    );
  }

  // Resolve which product(s) to buy: explicit `?products=` wins, else Pro.
  const requested = request.nextUrl.searchParams.getAll("products");
  const products = requested.length > 0 ? requested : [POLAR_PRODUCTS.pro];
  if (products.some((p) => !p)) {
    return NextResponse.json(
      { error: "No Polar product configured (set POLAR_PRODUCT_PRO)" },
      { status: 503 },
    );
  }

  // Upgrades are tied to an account, so the buyer must be signed in. Bounce to
  // login and come back to the checkout afterwards.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/api/checkout", request.url),
    );
  }

  try {
    const checkout = await polar.checkouts.create({
      products,
      successUrl: env.polarSuccessUrl(),
      externalCustomerId: user.id,
      customerEmail: user.email,
      customerName: user.name ?? undefined,
      customerMetadata: { appUserId: user.id, source: "free-cv" },
    });

    return NextResponse.redirect(checkout.url);
  } catch (error) {
    console.error("Polar checkout creation failed:", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }
}
