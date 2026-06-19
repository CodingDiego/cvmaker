import type { ResumeData } from "@/lib/cv/types";
import { buildResumePdf } from "../pdf-kit";
import type { DesignRenderOptions } from "../types";

export function renderPdf(data: ResumeData, opts: DesignRenderOptions) {
  return buildResumePdf(data, {
    accent: opts.accentColor || "#2f68d8",
    header: "band",
    uppercaseHeadings: true,
    nameSize: 26,
  });
}
