import { NextRequest, NextResponse } from "next/server";
import { polar, POLAR_PRODUCTS } from "@/lib/polar";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { buildPolarCheckoutLink } from "@/lib/polar-checkout-link";

/**
 * Polar checkout entrypoint for authenticated upgrades.
 *
 * Preferred path: redirect through the persistent Checkout Link configured in
 * Polar, adding user identity server-side.
 *
 * Fallback path: create a dynamic Checkout Session when POLAR_PRODUCT_PRO is
 * configured and no Checkout Link is set.
 */
export async function GET(request: NextRequest) {
  // Upgrades are tied to an account, so the buyer must be signed in. Bounce to
  // login and come back to the checkout afterwards.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/api/checkout", request.url),
    );
  }

  const checkoutLink = env.polarCheckoutLink();
  if (checkoutLink) {
    return NextResponse.redirect(buildPolarCheckoutLink(checkoutLink, user));
  }

  if (!env.hasPolar()) {
    return NextResponse.json(
      { error: "POLAR_ACCESS_TOKEN or POLAR_CHECKOUT_LINK is not configured" },
      { status: 503 },
    );
  }

  // Resolve which product(s) to buy: explicit `?products=` wins, else Pro.
  const requested = request.nextUrl.searchParams.getAll("products");
  const products = requested.length > 0 ? requested : [POLAR_PRODUCTS.pro];
  if (products.some((p) => !p)) {
    return NextResponse.json(
      { error: "No Polar checkout configured (set POLAR_CHECKOUT_LINK or POLAR_PRODUCT_PRO)" },
      { status: 503 },
    );
  }

  try {
    const checkout = await polar.checkouts.create({
      products,
      successUrl: env.polarSuccessUrl(),
      returnUrl: env.polarReturnUrl(),
      externalCustomerId: user.id,
      customerEmail: user.email,
      customerName: user.name ?? undefined,
      customerMetadata: { appUserId: user.id, source: "free-cv" },
      metadata: { appUserId: user.id, reference_id: user.id, source: "free-cv" },
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
