"use client";

import Link from "next/link";
import { ArrowLeft, Check, CloudOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCvStore } from "@/lib/cv/store";
import { TEMPLATES } from "@/templates/registry";
import { FONT_OPTIONS } from "@/lib/font-config";
import { ExportMenu } from "./export-menu";
import type { SaveStatus } from "@/lib/cv/use-autosave";

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5" /> Saved
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <CloudOff className="size-3.5" /> Save failed
      </span>
    );
  return null;
}

export function EditorToolbar({ status }: { status: SaveStatus }) {
  const cvId = useCvStore((s) => s.cvId);
  const title = useCvStore((s) => s.title);
  const templateId = useCvStore((s) => s.templateId);
  const fontFamily = useCvStore((s) => s.fontFamily);
  const accentColor = useCvStore((s) => s.accentColor);
  const setMeta = useCvStore((s) => s.setMeta);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-background px-4 py-2.5">
      <Button variant="ghost" size="icon-sm" aria-label="Back to dashboard" render={<Link href="/dashboard" />}>
        <ArrowLeft className="size-4" />
      </Button>

      <Input
        value={title}
        onChange={(e) => setMeta({ title: e.target.value })}
        className="h-8 w-44 font-medium"
        aria-label="CV title"
      />

      <div className="flex items-center gap-2">
        <Select value={templateId} onValueChange={(v) => setMeta({ templateId: v })}>
          <SelectTrigger size="sm" className="w-40" aria-label="Template">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fontFamily} onValueChange={(v) => setMeta({ fontFamily: v })}>
          <SelectTrigger size="sm" className="w-36" aria-label="Font">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Accent color">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setMeta({ accentColor: e.target.value })}
            className="size-8 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
            aria-label="Accent color"
          />
        </label>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <SaveIndicator status={status} />
        <ExportMenu cvId={cvId} />
      </div>
    </div>
  );
}
