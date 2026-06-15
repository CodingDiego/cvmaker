import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { FREE_DRAFT_LIMIT, type BillingPlan } from "@/lib/billing/entitlements";
import { getUserPlan } from "@/lib/billing/entitlements-server";
import { listCvs } from "@/lib/cv/service";
import { TemplateGallery } from "@/components/templates/template-gallery";
import type { TemplateDraft } from "@/components/templates/template-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, templatesCollectionPageLd, templatesItemListLd } from "@/lib/seo";
import { FREE_TEMPLATES, PRO_TEMPLATES } from "@/templates/registry";

export const metadata: Metadata = {
  title: "Resume Templates",
  description:
    "Browse free and premium ATS-friendly resume templates for CVMaker, then create a reusable CV draft.",
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "Resume Templates - CVMaker",
    description:
      "Browse free and premium ATS-friendly resume templates for CVMaker, then create a reusable CV draft.",
    url: "/templates",
  },
};

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  const draftsByTemplate: Record<string, TemplateDraft> = {};
  let draftCount = 0;
  let plan: BillingPlan = "free";

  if (user) {
    const [cvs, userPlan] = await Promise.all([listCvs(user.id), getUserPlan(user.id)]);
    draftCount = cvs.length;
    plan = userPlan;

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
      <JsonLd id="templates-collection-json-ld" data={templatesCollectionPageLd()} />
      <JsonLd id="templates-list-json-ld" data={templatesItemListLd()} />
      <JsonLd
        id="templates-breadcrumb-json-ld"
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Templates", path: "/templates" },
        ])}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-glow" />
      <section aria-labelledby="templates-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            {FREE_TEMPLATES.length} free templates + {PRO_TEMPLATES.length} Pro designs
          </span>
          <h1 id="templates-title" className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose your template
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground">
            Start with up to {FREE_DRAFT_LIMIT} free CV drafts, or upgrade to unlock premium
            templates and higher draft capacity.
          </p>
        </header>

        <TemplateGallery drafts={draftsByTemplate} plan={plan} draftCount={draftCount} />
      </section>
    </div>
  );
}
