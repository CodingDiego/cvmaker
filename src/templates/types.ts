import type { FontId } from "@/lib/font-config";

/**
 * A template is expressed as a set of design tokens consumed by all three
 * renderers (HTML preview, react-pdf, docx). This keeps 10 templates DRY: one
 * renderer per output target, parameterized by tokens — not 10× duplicated code.
 * Every template stays ATS-safe: real text, logical order, standard fonts.
 */
export type LayoutKind = "single" | "two-column";
export type HeaderAlign = "left" | "center";
export type SectionTitleStyle = "uppercase" | "capitalize" | "smallcaps" | "bar";
export type Density = "compact" | "normal" | "roomy";
export type AccentUsage = "none" | "rule" | "heading" | "name" | "sidebar";

export interface TemplateTokens {
  id: string;
  label: string;
  description: string;
  layout: LayoutKind;
  headerAlign: HeaderAlign;
  sectionTitle: SectionTitleStyle;
  divider: boolean;
  accent: AccentUsage;
  density: Density;
  /** Default font family (overridable per-CV). */
  font: FontId;
  /** Default accent color (overridable per-CV). */
  accentColor: string;
  /** Relative name size in px for the preview. */
  nameSize: number;
}

export const DENSITY_SPACING: Record<Density, { section: number; item: number; line: number }> = {
  compact: { section: 12, item: 6, line: 1.3 },
  normal: { section: 18, item: 9, line: 1.45 },
  roomy: { section: 24, item: 12, line: 1.6 },
};
