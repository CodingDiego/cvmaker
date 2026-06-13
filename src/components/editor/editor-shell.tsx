"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
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

  return (
    <div className="flex h-svh flex-col">
      <EditorToolbar status={status} />

      {/* Mobile view switch */}
      <div className="flex gap-1 border-b p-2 md:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium capitalize",
              view === v ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {v === "edit" ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}
            {v}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-2">
        <div
          className={cn(
            "min-h-0 overflow-y-auto border-r p-4",
            view === "edit" ? "block" : "hidden",
            "md:block",
          )}
        >
          <EditorForm />
        </div>
        <div
          className={cn(
            "min-h-0 overflow-y-auto bg-muted/30",
            view === "preview" ? "block" : "hidden",
            "md:block",
          )}
        >
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
