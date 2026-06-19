import "server-only";
import type { ResumeData } from "@/lib/cv/types";
import { rendererFor } from "./get-renderer";

/**
 * DOCX export entry point. Dispatches to the selected design's own docx
 * renderer (each linearizes to an ATS-safe document with the design's accent).
 */
export function renderDocx(
  data: ResumeData,
  opts: { templateId: string; accentColor?: string; fontFamily?: string },
): Promise<Buffer> {
  return rendererFor(opts.templateId).renderDocx(data, { accentColor: opts.accentColor });
}
