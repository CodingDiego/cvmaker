"use client";

import { Activity, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCvStore, type CvMeta } from "@/lib/cv/store";
import { useAutosave } from "@/lib/cv/use-autosave";
import type { ResumeData } from "@/lib/cv/types";
import { EditorToolbar } from "./editor-toolbar";
import { EditorForm } from "./editor-form";
import { LivePreview } from "./live-preview";

type EditorView = "edit" | "preview";

export function EditorShell({ cv }: { cv: CvMeta & { data: ResumeData } }) {
  // One-time synchronous store hydration from the server payload (runs once,
  // before children read the store).
  useState(() => {
    useCvStore.getState().init(cv);
    return null;
  });

  const [view, setView] = useState<EditorView>("edit");
  const { status } = useAutosave();
  const isMobile = useIsMobile();

  // On desktop both panels are visible; on mobile one at a time. Activity keeps
  // the hidden panel mounted (preserving the expensive live-preview scale/DOM
  // and scroll position) while de-prioritizing its rendering.
  const formMode = !isMobile || view === "edit" ? "visible" : "hidden";
  const previewMode = !isMobile || view === "preview" ? "visible" : "hidden";

  return (
    <div className="flex h-svh flex-col">
      <EditorToolbar status={status} />

      {/* Mobile view switch */}
      <div className="flex gap-1 border-b bg-card/40 p-2 md:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium capitalize transition-colors",
              view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {v === "edit" ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}
            {v}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Activity mode={formMode}>
          <div className="min-h-0 overflow-y-auto border-r p-4">
            <EditorForm />
          </div>
        </Activity>
        <Activity mode={previewMode}>
          <div className="min-h-0 overflow-y-auto bg-muted/30">
            <LivePreview />
          </div>
        </Activity>
      </div>
    </div>
  );
}
