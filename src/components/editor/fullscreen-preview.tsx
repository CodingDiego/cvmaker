"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "./live-preview";
import { useT } from "@/i18n/provider";

/**
 * Full-viewport overlay that shows the live preview on its own — gives the CV
 * the whole screen (most useful on mobile, where the split editor leaves the
 * preview cramped). Closes on Escape or the close button, and locks body scroll
 * while open. {@link LivePreview} measures its container, so it re-scales to the
 * larger area automatically.
 */
export function FullscreenPreview({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-card/60 px-4 py-2">
        <span className="text-sm font-medium">{t("editor.preview")}</span>
        <Button variant="ghost" size="icon" className="h-9" aria-label={t("editor.closePreviewAria")} onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30">
        <LivePreview />
      </div>
    </div>
  );
}
