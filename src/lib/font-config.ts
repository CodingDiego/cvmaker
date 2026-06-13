/**
 * ATS-safe font allowlist — pure config with no `next/font` import, so it can be
 * consumed by server-side renderers (react-pdf, docx) and the preview without
 * pulling Next's build-time font transform. The matching next/font instances
 * live in `@/lib/fonts` for the web app.
 */
export const FONT_OPTIONS = [
  { id: "inter", label: "Inter", cssVar: "var(--font-cv-inter)", docxName: "Calibri" },
  { id: "roboto", label: "Roboto", cssVar: "var(--font-cv-roboto)", docxName: "Arial" },
  { id: "lato", label: "Lato", cssVar: "var(--font-cv-lato)", docxName: "Calibri" },
  { id: "source", label: "Source Sans", cssVar: "var(--font-cv-source)", docxName: "Arial" },
  { id: "merriweather", label: "Merriweather (serif)", cssVar: "var(--font-cv-merriweather)", docxName: "Georgia" },
] as const;

export type FontId = (typeof FONT_OPTIONS)[number]["id"];

export function fontById(id: string) {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
}
