import type { ResumeData } from "@/lib/cv/types";
import { buildResumeDocx } from "../docx-kit";
import type { DesignRenderOptions } from "../types";

export function renderDocx(data: ResumeData, opts: DesignRenderOptions) {
  return buildResumeDocx(data, {
    accent: opts.accentColor || "#1c1c1c",
    font: "Arial",
    headerAlign: "left",
    headingUpper: true,
    divider: true,
    present: "Presente",
  });
}
