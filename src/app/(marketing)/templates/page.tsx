import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { listCvs } from "@/lib/cv/service";
import { TemplateGallery } from "@/components/templates/template-gallery";
import type { TemplateDraft } from "@/components/templates/template-card";
import { JsonLd } from "@/components/seo/json-ld";
import { templatesItemListLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Templates",
  description: "10 distinct ATS-friendly resume templates to choose from.",
};

export default async function TemplatesPage() {
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
      <JsonLd data={templatesItemListLd()} />
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

        <TemplateGallery drafts={draftsByTemplate} />
      </div>
    </div>
  );
}
