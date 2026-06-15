import type { TemplateTokens } from "./types";
import { PREMIUM_TEMPLATES } from "@premium";

/**
 * 10 ATS-friendly free templates. They are deliberately distinct in *silhouette*
 * — filled colored sidebars, tinted sidebars, editorial side-label gutters,
 * two-column newspaper bodies, full-width bands and top rules — not just color
 * and font, so they read as different designs even at thumbnail scale. All
 * variety is expressed as tokens so the renderers stay DRY.
 *
 * Premium (`access: "pro"`) designs are NOT defined here — they live in the
 * private `/.premium` overlay and are merged in via the `@premium` alias (see
 * `next.config.ts`). In the open-source build `@premium` resolves to an empty
 * stub, so this file alone fully describes the public template catalog.
 */
const FREE_TEMPLATE_DEFS: TemplateTokens[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Timeless centered header over ruled, uppercase section titles.",
    layout: "single",
    headerAlign: "center",
    sectionTitle: "uppercase",
    divider: true,
    accent: "rule",
    density: "normal",
    font: "inter",
    accentColor: "#1d4ed8",
    nameSize: 32,
    headerStyle: "underline",
    contactStyle: "inline",
    bullet: "disc",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Editorial side-label layout: tiny titles in a gutter, airy and monochrome.",
    layout: "single",
    headerAlign: "left",
    sectionTitle: "capitalize",
    divider: false,
    accent: "none",
    density: "roomy",
    font: "inter",
    accentColor: "#111827",
    nameSize: 28,
    headerStyle: "plain",
    contactStyle: "inline",
    bullet: "dash",
    sectionLayout: "side-label",
    titleUnderline: false,
  },
  {
    id: "professional",
    label: "Professional",
    description: "Bold filled sidebar holds your name, contact and skills. Corporate-ready.",
    layout: "two-column",
    headerAlign: "left",
    sectionTitle: "uppercase",
    divider: false,
    accent: "sidebar",
    density: "normal",
    font: "lato",
    accentColor: "#0f766e",
    nameSize: 26,
    headerStyle: "plain",
    contactStyle: "stacked",
    bullet: "square",
    sidebarStyle: "filled",
    sidebarSide: "left",
    monogram: true,
  },
  {
    id: "compact",
    label: "Compact",
    description: "Two-column newspaper flow packs dense, senior resumes onto one page.",
    layout: "single",
    headerAlign: "left",
    sectionTitle: "uppercase",
    divider: true,
    accent: "rule",
    density: "compact",
    font: "source",
    accentColor: "#4338ca",
    nameSize: 24,
    headerStyle: "underline",
    contactStyle: "inline",
    bullet: "square",
    bodyColumns: 2,
  },
  {
    id: "modern-serif",
    label: "Modern Serif",
    description: "Editorial serif with a thin top rule and an oversized colored name.",
    layout: "single",
    headerAlign: "left",
    sectionTitle: "smallcaps",
    divider: true,
    accent: "name",
    density: "normal",
    font: "merriweather",
    accentColor: "#9333ea",
    nameSize: 38,
    headerStyle: "plain",
    contactStyle: "inline",
    bullet: "disc",
    topRule: true,
    titleUnderline: true,
  },
  {
    id: "technical",
    label: "Technical",
    description: "Engineer card: boxed header, left accent bars on every section, tight spacing.",
    layout: "single",
    headerAlign: "left",
    sectionTitle: "bar",
    divider: false,
    accent: "rule",
    density: "compact",
    font: "source",
    accentColor: "#2563eb",
    nameSize: 27,
    headerStyle: "boxed",
    contactStyle: "stacked",
    bullet: "dash",
  },
  {
    id: "executive",
    label: "Executive",
    description: "Centered name in a full-width dark accent band. Formal and commanding.",
    layout: "single",
    headerAlign: "center",
    sectionTitle: "uppercase",
    divider: true,
    accent: "rule",
    density: "normal",
    font: "lato",
    accentColor: "#0f172a",
    nameSize: 34,
    headerStyle: "band",
    contactStyle: "inline",
    bullet: "disc",
    uppercaseName: true,
    letterSpacedName: true,
  },
  {
    id: "academic",
    label: "Academic",
    description: "Roomy serif CV with stacked contacts and underlined headings — ideal for research.",
    layout: "single",
    headerAlign: "left",
    sectionTitle: "capitalize",
    divider: false,
    accent: "none",
    density: "roomy",
    font: "merriweather",
    accentColor: "#1f2937",
    nameSize: 30,
    headerStyle: "underline",
    contactStyle: "stacked",
    bullet: "disc",
    titleUnderline: true,
  },
  {
    id: "two-column-ats",
    label: "Two Column",
    description: "Tinted right sidebar for skills & languages — still cleanly ATS-parseable.",
    layout: "two-column",
    headerAlign: "left",
    sectionTitle: "uppercase",
    divider: true,
    accent: "heading",
    density: "normal",
    font: "inter",
    accentColor: "#0369a1",
    nameSize: 30,
    headerStyle: "underline",
    contactStyle: "inline",
    bullet: "disc",
    sidebarTint: true,
    sidebarSide: "right",
  },
  {
    id: "elegant",
    label: "Elegant",
    description: "Centered small-caps headings, hairline rules and wide tracking. Refined.",
    layout: "single",
    headerAlign: "center",
    sectionTitle: "smallcaps",
    divider: true,
    accent: "heading",
    density: "roomy",
    font: "lato",
    accentColor: "#9f1239",
    nameSize: 34,
    headerStyle: "plain",
    contactStyle: "inline",
    bullet: "none",
    letterSpacedName: true,
    titleUnderline: false,
  },
];

/** Free public catalog + any premium designs from the private overlay. */
export const TEMPLATES: TemplateTokens[] = [...FREE_TEMPLATE_DEFS, ...PREMIUM_TEMPLATES];

export const FREE_DRAFT_LIMIT = 5;
export const FREE_TEMPLATES = TEMPLATES.filter((t) => t.access !== "pro");
export const PRO_TEMPLATES = TEMPLATES.filter((t) => t.access === "pro");

export const TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t.label]),
);

export function getTemplate(id: string): TemplateTokens {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

export function getTemplateAccess(id: string) {
  return getTemplate(id).access ?? "free";
}

export function isProTemplate(id: string) {
  return getTemplateAccess(id) === "pro";
}
