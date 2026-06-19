import type { ResumeData } from "@/lib/cv/types";
import { buildResumeDocx } from "../docx-kit";
import type { DesignRenderOptions } from "../types";

export function renderDocx(data: ResumeData, opts: DesignRenderOptions) {
  return buildResumeDocx(data, {
    accent: opts.accentColor || "#2f68d8",
    font: "Calibri",
    headerAlign: "left",
    headingUpper: true,
    headingAccent: true,
  });
}
