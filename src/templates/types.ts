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
/** How the name/contact block is treated. */
export type HeaderStyle = "plain" | "band" | "underline" | "boxed";
export type ContactStyle = "inline" | "stacked";
export type BulletStyle = "disc" | "dash" | "square" | "none";

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

  // --- Distinctive styling (optional; sensible defaults in the renderer) ---
  /** Treatment of the whole header block. */
  headerStyle?: HeaderStyle;
  /** Contact line layout. */
  contactStyle?: ContactStyle;
  /** Bullet marker shape for experience/project lists. */
  bullet?: BulletStyle;
  /** UPPERCASE the name. */
  uppercaseName?: boolean;
  /** Wide letter-spacing on the name (editorial feel). */
  letterSpacedName?: boolean;
  /** Underline only under the section-title text (not a full-width rule). */
  titleUnderline?: boolean;
  /** Render section titles as a filled accent chip. */
  accentChip?: boolean;
  /** Tint the sidebar (two-column layouts) with a faint accent wash. */
  sidebarTint?: boolean;
}

export const DENSITY_SPACING: Record<Density, { section: number; item: number; line: number }> = {
  compact: { section: 12, item: 6, line: 1.3 },
  normal: { section: 18, item: 9, line: 1.45 },
  roomy: { section: 24, item: 12, line: 1.6 },
};
