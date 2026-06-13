import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const checkoutLink = env.polarCheckoutLink();

  if (!checkoutLink) {
    return NextResponse.json(
      { error: "POLAR_CHECKOUT_LINK is not configured" },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  const url = new URL(checkoutLink);

  if (user) {
    url.searchParams.set("customer_external_id", user.id);
    url.searchParams.set("customer_email", user.email);
    if (user.name) url.searchParams.set("customer_name", user.name);
    url.searchParams.set(
      "customer_metadata",
      JSON.stringify({ appUserId: user.id, source: "free-cv" }),
    );
  }

  return NextResponse.redirect(url);
}