import type { TemplateTokens } from "./types";

/**
 * Public fallback for the `@premium` alias.
 *
 * Premium template designs are NOT part of this open-source repository. They
 * live in a private overlay at `/.premium` (git-ignored, its own repo). At
 * build time `next.config.ts` points the `@premium` import at the real overlay
 * when `/.premium/index.ts` exists, and at this empty stub otherwise — so the
 * open-source build compiles cleanly with only the free templates.
 *
 * To work on premium designs, clone the private overlay into `/.premium`.
 */
export const PREMIUM_TEMPLATES: TemplateTokens[] = [];
