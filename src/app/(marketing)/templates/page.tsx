import { getCurrentUser } from "@/lib/auth/session";
import { FREE_DRAFT_LIMIT, type BillingPlan } from "@/lib/billing/entitlements";
import { getUserPlan } from "@/lib/billing/entitlements-server";
import { listCvs } from "@/lib/cv/service";
import { TemplateGallery } from "@/components/templates/template-gallery";
import type { TemplateDraft } from "@/components/templates/template-card";
import { JsonLd } from "@/components/seo/json-ld";
import { templatesItemListLd } from "@/lib/seo";
import { FREE_TEMPLATES, PRO_TEMPLATES } from "@/templates/registry";

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
      <JsonLd data={templatesItemListLd()} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-glow" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            {FREE_TEMPLATES.length} free templates + {PRO_TEMPLATES.length} Pro designs
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose your template
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground">
            Start with up to {FREE_DRAFT_LIMIT} free CV drafts, or upgrade to unlock premium
            templates and higher draft capacity.
          </p>
        </div>

        <TemplateGallery drafts={draftsByTemplate} plan={plan} draftCount={draftCount} />
      </div>
    </div>
  );
}
