import type { ResumeData } from "@/lib/cv/types";
import { getDesign } from "@/templates/registry";
import { PAGE_W, PAGE_H } from "@/templates/designs/shared";

/**
 * On-screen CV preview. Dispatches to the selected design's bespoke React
 * layout. Isomorphic — used by the live editor preview (client) and by static
 * thumbnails/share pages (server). Keeps the page-size exports stable for the
 * consumers that scale the paper to fit.
 */
export const PAGE_WIDTH = PAGE_W;
export const PAGE_HEIGHT = PAGE_H;

export interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
  /** Per-CV accent override; falls back to the design default. */
  accentColor?: string;
  /** Accepted for call-site compatibility; font is design-locked and ignored. */
  fontFamily?: string;
  interactive?: boolean;
  placeholder?: ResumeData;
}

export function ResumePreview({ data, templateId, accentColor, interactive = true, placeholder }: ResumePreviewProps) {
  const { Preview } = getDesign(templateId);
  return <Preview data={data} accentColor={accentColor} interactive={interactive} placeholder={placeholder} />;
}
