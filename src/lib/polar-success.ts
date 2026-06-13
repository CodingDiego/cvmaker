export type PolarCheckoutStatus = "open" | "expired" | "confirmed" | "succeeded" | "failed";

export type PolarSuccessStateKind =
  | "missing-checkout"
  | "unverified"
  | "succeeded"
  | "processing"
  | "needs-retry"
  | "lookup-failed";

export type PolarSuccessState = {
  kind: PolarSuccessStateKind;
  tone: "success" | "info" | "warning" | "danger";
  title: string;
  description: string;
  checkoutId?: string;
};

export function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getPolarSuccessState({
  checkoutId,
  hasPolar,
  checkoutStatus,
  lookupFailed = false,
}: {
  checkoutId: string | undefined;
  hasPolar: boolean;
  checkoutStatus?: PolarCheckoutStatus;
  lookupFailed?: boolean;
}): PolarSuccessState {
  if (!checkoutId) {
    return {
      kind: "missing-checkout",
      tone: "warning",
      title: "Checkout not found",
      description: "This page needs Polar's checkout_id parameter to verify the payment.",
    };
  }

  if (!hasPolar) {
    return {
      kind: "unverified",
      tone: "info",
      title: "Payment received",
      description: "Polar sent you back successfully. We will finish access from the webhook once billing is configured.",
      checkoutId,
    };
  }

  if (lookupFailed) {
    return {
      kind: "lookup-failed",
      tone: "warning",
      title: "We are verifying your payment",
      description: "We could not read this checkout from Polar yet. Your access is still reconciled by the webhook.",
      checkoutId,
    };
  }

  if (checkoutStatus === "succeeded") {
    return {
      kind: "succeeded",
      tone: "success",
      title: "Payment complete",
      description: "Your checkout succeeded. Access is activated from Polar's webhook so it stays in sync with billing.",
      checkoutId,
    };
  }

  if (checkoutStatus === "failed" || checkoutStatus === "expired") {
    return {
      kind: "needs-retry",
      tone: "danger",
      title: checkoutStatus === "expired" ? "Checkout expired" : "Payment failed",
      description: "This checkout did not complete. You can return to checkout and try again.",
      checkoutId,
    };
  }

  return {
    kind: "processing",
    tone: "info",
    title: "Payment processing",
    description: "Polar is still finalizing this checkout. This page will not grant access until the webhook confirms it.",
    checkoutId,
  };
}
