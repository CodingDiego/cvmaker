import { ResumePreview, PAGE_HEIGHT, PAGE_WIDTH } from "@/templates/preview/resume-preview";
import type { ResumeData } from "@/lib/cv/types";

/**
 * Renders a ResumePreview scaled down to a target pixel width. Pointer events
 * are disabled so the thumbnail behaves like an image.
 */
export function PreviewThumbnail({
  data,
  templateId,
  accentColor,
  fontFamily,
  width = 280,
  height,
}: {
  data: ResumeData;
  templateId: string;
  accentColor?: string;
  fontFamily?: string;
  width?: number;
  /** Optional crop height (px). Defaults to the full page height. */
  height?: number;
}) {
  const scale = width / PAGE_WIDTH;
  return (
    <div
      style={{ width, height: height ?? PAGE_HEIGHT * scale, overflow: "hidden" }}
      className="pointer-events-none select-none bg-white"
      aria-hidden
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_WIDTH }}>
        <ResumePreview data={data} templateId={templateId} accentColor={accentColor} fontFamily={fontFamily} interactive={false} />
      </div>
    </div>
  );
}
