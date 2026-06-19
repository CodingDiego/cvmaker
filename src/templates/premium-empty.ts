import type { PremiumDesign } from "./designs/types";

/**
 * Public fallback for the `@premium` alias (client-safe metadata + previews).
 *
 * Premium designs are NOT part of this open-source repository. They live in a
 * private overlay at `/.premium` (git-ignored, its own repo). At build time
 * `next.config.ts` points `@premium` at the real overlay when `/.premium`
 * exists, and at this empty stub otherwise — so the open-source build compiles
 * cleanly with only the free designs.
 *
 * To work on premium designs, clone the private overlay into `/.premium`.
 */
export const PREMIUM_DESIGNS: PremiumDesign[] = [];
