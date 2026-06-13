import "server-only";
import { env } from "@/lib/env";
import { polar } from "@/lib/polar";
import { getPolarSuccessState, type PolarCheckoutStatus } from "@/lib/polar-success";

export async function loadPolarSuccessState(checkoutId: string | undefined) {
  if (!checkoutId || !env.hasPolar()) {
    return getPolarSuccessState({ checkoutId, hasPolar: env.hasPolar() });
  }

  try {
    const checkout = await polar.checkouts.get({ id: checkoutId });
    return getPolarSuccessState({
      checkoutId,
      hasPolar: true,
      checkoutStatus: checkout.status as PolarCheckoutStatus,
    });
  } catch {
    return getPolarSuccessState({
      checkoutId,
      hasPolar: true,
      lookupFailed: true,
    });
  }
}
