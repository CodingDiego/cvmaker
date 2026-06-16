"use client";

import { useEffect, useRef, useState } from "react";
import { PreviewThumbnail } from "./preview-thumbnail";
import type { ResumeData } from "@/lib/cv/types";
import type { TemplateTokens } from "@/templates/types";

/**
 * A {@link PreviewThumbnail} that fills its parent's width and is cropped to a
 * fixed aspect ratio. Unlike PreviewThumbnail (which needs a fixed pixel width),
 * this measures its container, so it never overflows narrow viewports — used in
 * fluid grids like the dashboard card where a hard-coded width broke mobile.
 */
export function ResponsiveThumbnail({
  data,
  tokens,
  accentColor,
  fontFamily,
  /** Cropped height as a fraction of the measured width (default ≈ 300×210). */
  ratio = 210 / 300,
}: {
  data: ResumeData;
  tokens: TemplateTokens;
  accentColor?: string;
  fontFamily?: string;
  ratio?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const height = Math.round(width * ratio);

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden bg-white"
      // Reserve the box before measuring so the card doesn't jump on mount.
      style={width ? { height } : { aspectRatio: `1 / ${ratio}` }}
    >
      {width > 0 && (
        <PreviewThumbnail
          data={data}
          tokens={tokens}
          width={width}
          height={height}
          accentColor={accentColor}
          fontFamily={fontFamily}
        />
      )}
    </div>
  );
}
