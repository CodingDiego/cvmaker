import type { DesignMeta, PremiumDesign } from "./designs/types";
import { FREE_DESIGNS } from "./designs";
import { PREMIUM_DESIGNS } from "@premium";

/**
 * The full design catalog: the public free designs plus any premium designs
 * from the private `/.premium` overlay (merged via the `@premium` alias; an
 * empty stub in the open-source build). Each entry carries client-safe metadata
 * and its on-screen preview. Export renderers live separately (server-only) in
 * `render/pdf.tsx` + `render/docx.ts` so they never reach client bundles.
 */
export const DESIGNS: PremiumDesign[] = [...FREE_DESIGNS, ...PREMIUM_DESIGNS];

/** Fallback design for retired/unknown template ids (e.g. legacy drafts). */
export const DEFAULT_TEMPLATE_ID = "clasico-ats";

export const TEMPLATES: DesignMeta[] = DESIGNS.map((d) => d.meta);

export const FREE_DRAFT_LIMIT = 5;
export const FREE_TEMPLATES = TEMPLATES.filter((t) => t.access !== "pro");
export const PRO_TEMPLATES = TEMPLATES.filter((t) => t.access === "pro");

export const TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t.label]),
);

export function getDesign(id: string): PremiumDesign {
  return (
    DESIGNS.find((d) => d.meta.id === id) ??
    DESIGNS.find((d) => d.meta.id === DEFAULT_TEMPLATE_ID) ??
    DESIGNS[0]!
  );
}

/** Metadata for a template id, falling back to the default design. */
export function getTemplate(id: string): DesignMeta {
  return getDesign(id).meta;
}

export function getTemplateAccess(id: string) {
  return getTemplate(id).access ?? "free";
}

export function isProTemplate(id: string) {
  return getTemplateAccess(id) === "pro";
}
