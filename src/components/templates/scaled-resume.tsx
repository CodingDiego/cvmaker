"use client";

import { useEffect, useRef, useState } from "react";
import { ResumePreview, PAGE_HEIGHT, PAGE_WIDTH } from "@/templates/preview/resume-preview";
import type { ResumeData } from "@/lib/cv/types";
import type { TemplateTokens } from "@/templates/types";

/** Renders a resume page scaled responsively to fit its container width. */
export function ScaledResume({
  data,
  tokens,
  accentColor,
  fontFamily,
  maxWidth = PAGE_WIDTH,
}: {
  data: ResumeData;
  tokens: TemplateTokens;
  accentColor?: string;
  fontFamily?: string;
  maxWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setScale(Math.min(maxWidth, el.clientWidth) / PAGE_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxWidth]);

  return (
    <div ref={ref} className="w-full">
      <div style={{ height: PAGE_HEIGHT * scale }}>
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_WIDTH }}
          className="overflow-hidden rounded-lg shadow-xl ring-1 ring-black/10"
        >
          <ResumePreview data={data} tokens={tokens} accentColor={accentColor} fontFamily={fontFamily} />
        </div>
      </div>
    </div>
  );
}
