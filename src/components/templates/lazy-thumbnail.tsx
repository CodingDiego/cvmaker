"use client";

import { useEffect, useRef, useState } from "react";
import { PreviewThumbnail } from "./preview-thumbnail";
import type { ResumeData } from "@/lib/cv/types";

/**
 * Mounts a {@link PreviewThumbnail} only once its placeholder box approaches the
 * viewport. Each thumbnail is a full `ResumePreview` render (heavy DOM + many
 * inline styles); deferring the offscreen ones keeps them out of the landing
 * page's initial work. The box reserves the exact `width`/`height` up front so
 * there is no layout shift when the real preview swaps in.
 */
export function LazyThumbnail({
  data,
  templateId,
  width,
  height,
  accentColor,
  fontFamily,
  rootMargin = "300px",
}: {
  data: ResumeData;
  templateId: string;
  width: number;
  height: number;
  accentColor?: string;
  fontFamily?: string;
  /** How early to mount before the box scrolls into view. */
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Old browsers without IO: just render on the next frame (keeps the
      // initial render identical to SSR so there's no hydration mismatch).
      const id = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} style={{ width, height }} className="cv-thumb bg-white">
      {show ? (
        <PreviewThumbnail
          data={data}
          templateId={templateId}
          width={width}
          height={height}
          accentColor={accentColor}
          fontFamily={fontFamily}
        />
      ) : null}
    </div>
  );
}
