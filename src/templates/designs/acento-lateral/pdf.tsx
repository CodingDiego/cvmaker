import type { ResumeData } from "@/lib/cv/types";
import { buildResumePdf } from "../pdf-kit";
import type { DesignRenderOptions } from "../types";

export function renderPdf(data: ResumeData, opts: DesignRenderOptions) {
  return buildResumePdf(data, {
    accent: opts.accentColor || "#0d9488",
    header: "plain",
    uppercaseHeadings: true,
    sidebar: { side: "left", dark: true, sections: ["skills", "languages", "certifications"] },
  });
}
