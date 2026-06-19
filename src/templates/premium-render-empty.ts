import type { DesignRenderer } from "./designs/types";

/**
 * Public fallback for the `@premium/render` alias (server-only export
 * renderers). Empty in the open-source build; the private `/.premium` overlay
 * supplies the real per-design PDF/DOCX renderers when present.
 */
export const PREMIUM_RENDERERS: DesignRenderer[] = [];
