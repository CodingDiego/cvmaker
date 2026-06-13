"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEMPLATES } from "@/templates/registry";
import { sampleResume } from "@/lib/cv/types";
import { FONT_OPTIONS, fontById } from "@/lib/font-config";
import { templateSearchParsers } from "@/lib/search-params";
import { PreviewThumbnail } from "@/components/templates/preview-thumbnail";
import { UseTemplateButton, type TemplateDraft } from "@/components/templates/template-card";

/**
 * Filterable template gallery. The template set is static (10 designs), so
 * search + font filtering happen client-side; nuqs keeps both in the URL so a
 * filtered gallery is shareable and survives refresh.
 */
export function TemplateGallery({ drafts }: { drafts: Record<string, TemplateDraft> }) {
  const sample = useMemo(() => sampleResume(), []);

  const [{ q, font }, setFilters] = useQueryStates(templateSearchParsers, {
    history: "replace",
  });

  const [input, setInput] = useState(q);
  useEffect(() => setInput(q), [q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (input !== q) setFilters({ q: input || null });
    }, 250);
    return () => clearTimeout(t);
  }, [input, q, setFilters]);

  const filtered = useMemo(() => {
    const needle = input.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      const matchesText =
        !needle ||
        t.label.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle);
      const matchesFont = font === "all" || t.font === font;
      return matchesText && matchesFont;
    });
  }, [input, font]);

  return (
    <div className="space-y-8">
      <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search templates…"
            className="pl-9"
            aria-label="Search templates"
          />
        </div>
        <Select
          value={font}
          onValueChange={(v) => v && setFilters({ font: v === "all" ? null : v })}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by font">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fonts</SelectItem>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label.replace(" (serif)", "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No templates match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {filtered.map((tokens) => (
            <article
              key={tokens.id}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative flex justify-center overflow-hidden border-b bg-gradient-to-b from-muted/40 to-muted/10 p-5">
                <div
                  className="overflow-hidden rounded-md shadow-lg ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{ height: 320 }}
                >
                  <PreviewThumbnail data={sample} tokens={tokens} width={226} />
                </div>
                <span
                  className="absolute top-3 right-3 size-4 rounded-full ring-2 ring-white/80"
                  style={{ background: tokens.accentColor }}
                  aria-hidden
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{tokens.label}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] text-muted-foreground">
                      {fontById(tokens.font).label.replace(" (serif)", "")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{tokens.description}</p>
                </div>
                <UseTemplateButton templateId={tokens.id} draft={drafts[tokens.id]} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
