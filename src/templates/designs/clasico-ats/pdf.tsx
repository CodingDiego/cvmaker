import type { ResumeData } from "@/lib/cv/types";
import { buildResumePdf } from "../pdf-kit";
import type { DesignRenderOptions } from "../types";

export function renderPdf(data: ResumeData, opts: DesignRenderOptions) {
  return buildResumePdf(data, {
    accent: opts.accentColor || "#1c1c1c",
    header: "underline",
    uppercaseHeadings: true,
    present: "Presente",
  });
}
