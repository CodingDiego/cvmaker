import { ResumePreview, PAGE_WIDTH } from "@/templates/preview/resume-preview";
import type { ResumeData } from "@/lib/cv/types";
import type { TemplateTokens } from "@/templates/types";

/**
 * Renders a ResumePreview scaled down to a target pixel width. Pointer events
 * are disabled so the thumbnail behaves like an image.
 */
export function PreviewThumbnail({
  data,
  tokens,
  accentColor,
  fontFamily,
  width = 280,
  height,
}: {
  data: ResumeData;
  tokens: TemplateTokens;
  accentColor?: string;
  fontFamily?: string;
  width?: number;
  /** Optional crop height (px). Defaults to the full A4 page height. */
  height?: number;
}) {
  const scale = width / PAGE_WIDTH;
  return (
    <div
      style={{ width, height: height ?? width * 1.414, overflow: "hidden" }}
      className="pointer-events-none select-none bg-white"
      aria-hidden
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_WIDTH }}>
        <ResumePreview data={data} tokens={tokens} accentColor={accentColor} fontFamily={fontFamily} interactive={false} />
      </div>
    </div>
  );
}
