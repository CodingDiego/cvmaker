import "server-only";
import type { ResumeData } from "@/lib/cv/types";
import { rendererFor } from "./get-renderer";

/**
 * PDF export entry point. Dispatches to the selected design's own react-pdf
 * renderer. The font/accent overrides come from the stored CV; font is
 * design-locked, so only the accent override is forwarded.
 */
export function renderPdf(
  data: ResumeData,
  opts: { templateId: string; accentColor?: string; fontFamily?: string },
): Promise<Buffer> {
  return rendererFor(opts.templateId).renderPdf(data, { accentColor: opts.accentColor });
}
