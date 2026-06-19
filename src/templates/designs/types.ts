import type { ReactNode } from "react";
import type { ResumeData } from "@/lib/cv/types";
import type { TemplateAccess } from "@/templates/types";

/**
 * The new template system: each CV design is a self-contained module instead of
 * a configuration of the old shared token renderer. A design owns three
 * renderers over the shared {@link ResumeData} model — an on-screen React
 * preview (pixel-perfect), a react-pdf renderer and a docx renderer.
 *
 * Metadata (client-safe, pure data) is kept separate from the renderers so the
 * gallery/editor/gating code can import design info without pulling react-pdf or
 * docx into client bundles. Free designs live under `src/templates/designs/`;
 * premium designs live in the private `/.premium` overlay (see `@premium`).
 */

export type LangBadge = "ES" | "EN";

export interface DesignMeta {
  id: string;
  /** English fallback label (gallery uses i18n `templates.designs.<id>.*` first). */
  label: string;
  description: string;
  access: TemplateAccess;
  /** Default accent color (hex). Overridable per-CV; designs derive tints from it. */
  accentColor: string;
  /** i18n category key suffix shown in the gallery caption (`templates.categories.<key>`). */
  categoryKey: string;
  langBadge: LangBadge;
}

export interface PreviewProps {
  data: ResumeData;
  /** Per-CV accent override; falls back to the design's default. */
  accentColor?: string;
  /**
   * When false, links render as plain styled text (for thumbnails sitting inside
   * an outer <a>, which would otherwise nest anchors).
   */
  interactive?: boolean;
  /**
   * Example content (matched by item id) shown as faded placeholder text where a
   * field is blank. Only the live editor preview passes this.
   */
  placeholder?: ResumeData;
}

export type DesignPreview = (props: PreviewProps) => ReactNode;

/** Client-safe half of a design: metadata + the React preview. */
export interface PremiumDesign {
  meta: DesignMeta;
  Preview: DesignPreview;
}

export interface DesignRenderOptions {
  accentColor?: string;
}

/** Server-only half of a design: the export renderers. */
export interface DesignRenderer {
  id: string;
  renderPdf: (data: ResumeData, opts: DesignRenderOptions) => Promise<Buffer>;
  renderDocx: (data: ResumeData, opts: DesignRenderOptions) => Promise<Buffer>;
}
