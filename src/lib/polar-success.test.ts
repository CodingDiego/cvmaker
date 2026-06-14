import { describe, expect, test } from "bun:test";
import { getPolarSuccessState, polarCheckoutIdFromSearchParams } from "./polar-success";

describe("polarCheckoutIdFromSearchParams", () => {
  test("reads the documented checkout_id parameter", () => {
    expect(polarCheckoutIdFromSearchParams({ checkout_id: "chk_123" })).toBe("chk_123");
  });

  test("also reads the checkoutId parameter emitted by the Next adapter", () => {
    expect(polarCheckoutIdFromSearchParams({ checkoutId: "chk_123" })).toBe("chk_123");
  });

  test("ignores empty placeholder keys from a broken Polar success URL", () => {
    expect(
      polarCheckoutIdFromSearchParams({
        "CHECKOUT_ID}": "",
        customer_session_token: "polar_cst_123",
      }),
    ).toBeUndefined();
  });
});

describe("getPolarSuccessState", () => {
  test("asks for a checkout id when the success URL is opened directly", () => {
    expect(getPolarSuccessState({ checkoutId: undefined, hasPolar: true })).toMatchObject({
      kind: "missing-checkout",
      tone: "warning",
    });
  });

  test("shows an unverified state when Polar is not configured", () => {
    expect(getPolarSuccessState({ checkoutId: "chk_123", hasPolar: false })).toMatchObject({
      kind: "unverified",
      tone: "info",
      checkoutId: "chk_123",
    });
  });

  test("treats succeeded checkouts as complete", () => {
    expect(
      getPolarSuccessState({
        checkoutId: "chk_123",
        hasPolar: true,
        checkoutStatus: "succeeded",
      }),
    ).toMatchObject({
      kind: "succeeded",
      tone: "success",
      checkoutId: "chk_123",
    });
  });

  test.each(["open", "confirmed"] as const)("keeps %s checkouts in a processing state", (checkoutStatus) => {
    expect(
      getPolarSuccessState({
        checkoutId: "chk_123",
        hasPolar: true,
        checkoutStatus,
      }),
    ).toMatchObject({
      kind: "processing",
      tone: "info",
      checkoutId: "chk_123",
    });
  });

  test.each(["failed", "expired"] as const)("shows a retry state for %s checkouts", (checkoutStatus) => {
    expect(
      getPolarSuccessState({
        checkoutId: "chk_123",
        hasPolar: true,
        checkoutStatus,
      }),
    ).toMatchObject({
      kind: "needs-retry",
      tone: "danger",
      checkoutId: "chk_123",
    });
  });

  test("shows a verification error when the checkout lookup fails", () => {
    expect(
      getPolarSuccessState({
        checkoutId: "chk_123",
        hasPolar: true,
        lookupFailed: true,
      }),
    ).toMatchObject({
      kind: "lookup-failed",
      tone: "warning",
      checkoutId: "chk_123",
    });
  });
});
