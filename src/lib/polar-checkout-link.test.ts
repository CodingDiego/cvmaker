import { describe, expect, test } from "bun:test";
import { buildPolarCheckoutLink } from "./polar-checkout-link";

describe("buildPolarCheckoutLink", () => {
  test("adds the signed-in user identity to the hosted checkout link", () => {
    const url = new URL(
      buildPolarCheckoutLink("https://buy.polar.sh/polar_cl_123?theme=dark", {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "buyer@example.com",
        name: "Buyer Name",
      }),
    );

    expect(url.origin).toBe("https://buy.polar.sh");
    expect(url.pathname).toBe("/polar_cl_123");
    expect(url.searchParams.get("theme")).toBe("dark");
    expect(url.searchParams.get("customer_external_id")).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(url.searchParams.get("reference_id")).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(url.searchParams.get("customer_email")).toBe("buyer@example.com");
    expect(url.searchParams.get("customer_name")).toBe("Buyer Name");
  });
});
