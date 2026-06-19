import type { ResumeData } from "@/lib/cv/types";
import { buildResumeDocx } from "../docx-kit";
import type { DesignRenderOptions } from "../types";

export function renderDocx(data: ResumeData, opts: DesignRenderOptions) {
  return buildResumeDocx(data, {
    accent: opts.accentColor || "#16a34a",
    font: "Consolas",
    headerAlign: "left",
    headingAccent: true,
  });
}
