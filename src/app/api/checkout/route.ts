import { Checkout } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { POLAR_PRODUCTS } from "@/lib/polar";

const checkout = Checkout({
  accessToken: env.polarAccessToken() ?? "",
  successUrl: env.polarSuccessUrl(),
  returnUrl: env.polarReturnUrl(),
  server: env.polarServer(),
  includeCheckoutId: false,
});

export async function GET(request: NextRequest) {
  if (!env.polarAccessToken()) {
    return NextResponse.json(
      { error: "POLAR_ACCESS_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  if (url.searchParams.getAll("products").length === 0) {
    const defaultProduct = POLAR_PRODUCTS.pro;
    if (!defaultProduct) {
      return NextResponse.json(
        { error: "POLAR_PRODUCT_PRO is not configured" },
        { status: 503 },
      );
    }
    url.searchParams.append("products", defaultProduct);
  }

  const user = await getCurrentUser();
  if (user) {
    url.searchParams.set("customerExternalId", user.id);
    url.searchParams.set("customerEmail", user.email);
    if (user.name) url.searchParams.set("customerName", user.name);
    url.searchParams.set(
      "customerMetadata",
      JSON.stringify({ appUserId: user.id, source: "free-cv" }),
    );
  }

  return checkout(new NextRequest(url));
}
