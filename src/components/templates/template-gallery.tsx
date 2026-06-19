"use client";

/* eslint-disable react-hooks/static-components -- Chip is a pure, stateless
   presentational helper; it holds no state to reset. */
import { useEffect, useMemo, useState } from "react";
import { TEMPLATES } from "@/templates/registry";
import { sampleResume } from "@/lib/cv/types";
import { PreviewThumbnail } from "@/components/templates/preview-thumbnail";
import { ResumePreview, PAGE_WIDTH, PAGE_HEIGHT } from "@/templates/preview/resume-preview";
import { UseTemplateButton, type TemplateDraft } from "@/components/templates/template-card";
import type { BillingPlan } from "@/lib/billing/entitlements";
import { useT } from "@/i18n/provider";

type Tier = "all" | "free" | "premium";

/**
 * Template gallery modelled on the CV-Galería design: a Todas/Gratis/Premium
 * filter, a grid of scaled live previews with Free/Premium badges, and a
 * full-size click-to-preview overlay whose "Use template" action runs the
 * existing auth/upgrade/draft flow.
 */
export function TemplateGallery({
  drafts,
  plan,
  draftCount,
  isAuthed,
}: {
  drafts: Record<string, TemplateDraft>;
  plan: BillingPlan;
  draftCount: number;
  isAuthed: boolean;
}) {
  const t = useT();
  const sample = useMemo(() => sampleResume(), []);
  const [tier, setTier] = useState<Tier>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [scale, setScale] = useState(0.7);

  useEffect(() => {
    if (!selected) return;
    const fit = () =>
      setScale(
        Math.max(0.32, Math.min((window.innerHeight - 170) / PAGE_HEIGHT, (window.innerWidth - 48) / PAGE_WIDTH, 0.95)),
      );
    fit();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("resize", fit);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const list = TEMPLATES.filter((m) =>
    tier === "all" ? true : tier === "premium" ? m.access === "pro" : m.access !== "pro",
  );
  const sel = selected ? TEMPLATES.find((m) => m.id === selected) ?? null : null;

  const Chip = ({ value, label }: { value: Tier; label: string }) => (
    <button
      type="button"
      onClick={() => setTier(value)}
      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
        tier === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  const badge = (isPro: boolean) =>
    `absolute right-2.5 top-2.5 rounded-md px-2 py-1 text-[0.65rem] font-bold tracking-wide ${
      isPro ? "bg-amber-500 text-white" : "bg-foreground text-background"
    }`;

  return (
    <div className="space-y-10">
      <div className="flex justify-center">
        <div className="inline-flex gap-1 rounded-xl bg-muted p-1">
          <Chip value="all" label={t("templates.filterAll")} />
          <Chip value="free" label={t("templates.filterFree")} />
          <Chip value="premium" label={t("templates.filterPremium")} />
        </div>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          {t("templates.noMatch")}
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-7 gap-y-9">
          {list.map((m) => {
            const isPro = m.access === "pro";
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.id)}
                aria-label={t("templates.previewAria", { name: m.label })}
                className="group w-[304px] text-left"
              >
                <div className="relative h-[430px] w-[304px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <PreviewThumbnail data={sample} templateId={m.id} width={304} />
                  <span className={badge(isPro)}>{isPro ? t("templates.premiumBadge") : t("templates.freeBadge")}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2 px-1">
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {t(`templates.categories.${m.categoryKey}`)} · {m.langBadge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {sel ? (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex flex-col items-center overflow-auto bg-black/65 p-5 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-4 flex w-full max-w-[760px] items-center justify-between gap-3 text-white"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-base font-bold">{sel.label}</span>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-[0.65rem] font-bold tracking-wide ${
                  sel.access === "pro" ? "bg-amber-500" : "bg-white/20"
                }`}
              >
                {sel.access === "pro" ? t("templates.premiumBadge") : t("templates.freeBadge")}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="w-44">
                <UseTemplateButton
                  templateId={sel.id}
                  access={sel.access}
                  draft={drafts[sel.id]}
                  plan={plan}
                  draftCount={draftCount}
                  isAuthed={isAuthed}
                />
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label={t("templates.closePreview")}
                className="flex size-9 items-center justify-center rounded-lg bg-white/20 text-xl leading-none text-white hover:bg-white/30"
              >
                ×
              </button>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} style={{ width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale }}>
            <div
              style={{ width: PAGE_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}
              className="overflow-hidden rounded shadow-2xl"
            >
              <ResumePreview data={sample} templateId={sel.id} interactive={false} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
