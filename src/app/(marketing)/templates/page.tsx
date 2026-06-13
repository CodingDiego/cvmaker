import type { Metadata } from "next";
import { TEMPLATES } from "@/templates/registry";
import { sampleResume } from "@/lib/cv/types";
import { fontById } from "@/lib/font-config";
import { getCurrentUser } from "@/lib/auth/session";
import { listCvs } from "@/lib/cv/service";
import { PreviewThumbnail } from "@/components/templates/preview-thumbnail";
import { UseTemplateButton, type TemplateDraft } from "@/components/templates/template-card";

export const metadata: Metadata = {
  title: "Templates",
  description: "10 distinct ATS-friendly resume templates to choose from.",
};

export default async function TemplatesPage() {
  const sample = sampleResume();

  // Map each template to the user's most-recent draft using it (if any), so the
  // gallery can offer "continue draft vs start new" without losing work.
  const user = await getCurrentUser();
  const draftsByTemplate: Record<string, TemplateDraft> = {};
  if (user) {
    const cvs = await listCvs(user.id); // ordered newest-first
    for (const cv of cvs) {
      if (!draftsByTemplate[cv.templateId]) {
        draftsByTemplate[cv.templateId] = {
          id: cv.id,
          title: cv.title,
          updatedAt: cv.updatedAt.toISOString(),
        };
      }
    }
  }

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-glow" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            10 distinct designs · all ATS-safe
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose your template
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground">
            Every design parses cleanly through applicant tracking systems. Pick one to start — you can
            switch any time without losing content.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {TEMPLATES.map((tokens) => (
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
                <UseTemplateButton templateId={tokens.id} draft={draftsByTemplate[tokens.id]} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
