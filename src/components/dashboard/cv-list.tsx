"use client";

import { useDeferredValue, useMemo } from "react";
import { Link } from "@/components/link";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cvListOptions } from "@/lib/cv/cv-queries";
import { cvSearchParsers } from "@/lib/search-params";
import { TEMPLATES, TEMPLATE_LABELS } from "@/templates/registry";
import { CvCard } from "./cv-card";

/**
 * Dashboard CV grid. Data is server-prefetched into React Query and hydrated;
 * search + template filtering is URL-synced via nuqs and applied client-side
 * over the already-fetched list (no extra round-trips).
 */
export function CvList() {
  const { data: cvs = [] } = useQuery(cvListOptions());

  // URL is the source of truth for the filters (shareable, survives refresh).
  // nuqs updates `q` synchronously for instant input feedback while throttling
  // the actual URL writes; `history: 'replace'` keeps typing out of the back stack.
  const [{ q, template }, setFilters] = useQueryStates(cvSearchParsers, {
    history: "replace",
    throttleMs: 200,
  });

  // Defer the (potentially heavier) filter pass so typing stays snappy.
  const deferredQ = useDeferredValue(q);
  const filtered = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    return cvs.filter((cv) => {
      const matchesText = !needle || cv.title.toLowerCase().includes(needle);
      const matchesTemplate = template === "all" || cv.templateId === template;
      return matchesText && matchesTemplate;
    });
  }, [cvs, deferredQ, template]);

  // No CVs at all → onboarding empty state (no filter UI).
  if (cvs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="font-medium">No CVs yet</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Pick a template to start building your resume.
        </p>
        <Button render={<Link href="/templates" />}>
          <Plus className="size-4" /> Browse templates
        </Button>
      </div>
    );
  }

  // Only show template options the user actually has CVs for, plus "All".
  const usedTemplates = TEMPLATES.filter((t) => cvs.some((cv) => cv.templateId === t.id));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setFilters({ q: e.target.value || null })}
            placeholder="Search your CVs by title…"
            className="pl-9"
            aria-label="Search CVs"
          />
        </div>
        {usedTemplates.length > 1 && (
          <Select
            value={template}
            onValueChange={(v) => v && setFilters({ template: v === "all" ? null : v })}
          >
            <SelectTrigger className="w-full sm:w-52" aria-label="Filter by template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {usedTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {TEMPLATE_LABELS[t.id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No CVs match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cv) => (
            <CvCard
              key={cv.id}
              id={cv.id}
              title={cv.title}
              templateId={cv.templateId}
              updatedAt={cv.updatedAt}
              data={cv.data}
              accentColor={cv.accentColor}
              fontFamily={cv.fontFamily}
              isPublic={cv.isPublic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
