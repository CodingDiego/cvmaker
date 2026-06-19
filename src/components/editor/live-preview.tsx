"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCvStore } from "@/lib/cv/store";
import { sampleResume } from "@/lib/cv/types";
import { ResumePreview, PAGE_WIDTH } from "@/templates/preview/resume-preview";

export function LivePreview() {
  const data = useCvStore((s) => s.data);
  const templateId = useCvStore((s) => s.templateId);
  const accentColor = useCvStore((s) => s.accentColor);
  const fontFamily = useCvStore((s) => s.fontFamily);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const available = el.clientWidth - 32; // padding allowance
      setScale(Math.min(1, available / PAGE_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Static example content shown as faded placeholders wherever a field is blank
  // (matched to the document by item id). Built once.
  const placeholder = useMemo(() => sampleResume(), []);

  if (!data.header) return null;

  return (
    <div ref={containerRef} className="flex justify-center overflow-auto px-4 py-6 sm:py-8">
      <div
        style={{
          width: PAGE_WIDTH * scale,
          height: PAGE_WIDTH * 1.414 * scale,
        }}
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_WIDTH }}
          className="shadow-lg ring-1 ring-black/10"
        >
          <ResumePreview
            data={data}
            templateId={templateId}
            accentColor={accentColor}
            fontFamily={fontFamily}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}
