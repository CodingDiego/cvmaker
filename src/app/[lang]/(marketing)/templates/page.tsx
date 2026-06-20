import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { FREE_DRAFT_LIMIT, type BillingPlan } from "@/lib/billing/entitlements";
import { getUserPlan } from "@/lib/billing/entitlements-server";
import { listCvs } from "@/lib/cv/service";
import { TemplateGallery } from "@/components/templates/template-gallery";
import type { TemplateDraft } from "@/components/templates/template-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, pageMetadata, templatesCollectionPageLd, templatesItemListLd } from "@/lib/seo";
import { seoCopy } from "@/lib/seo-copy";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getTFromParams } from "@/i18n/server";
import { FREE_TEMPLATES, PRO_TEMPLATES } from "@/templates/registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  return pageMetadata({ lang: locale, path: "/templates", ...seoCopy.templates[locale] });
}

export default async function TemplatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const [{ lang }, user, t] = await Promise.all([params, getCurrentUser(), getTFromParams(params)]);
  const locale = isLocale(lang) ? lang : defaultLocale;
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
      <JsonLd id="templates-collection-json-ld" data={templatesCollectionPageLd(locale)} />
      <JsonLd id="templates-list-json-ld" data={templatesItemListLd(locale)} />
      <JsonLd
        id="templates-breadcrumb-json-ld"
        data={breadcrumbLd(
          [
            { name: "Home", path: "/" },
            { name: "Templates", path: "/templates" },
          ],
          locale,
        )}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-glow" />
      <section aria-labelledby="templates-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            {t("templates.count", { free: FREE_TEMPLATES.length, pro: PRO_TEMPLATES.length })}
          </span>
          <h1 id="templates-title" className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("templates.title")}
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground">
            {t("templates.subtitle", { limit: FREE_DRAFT_LIMIT })}
          </p>
        </header>

        <TemplateGallery drafts={draftsByTemplate} plan={plan} draftCount={draftCount} isAuthed={!!user} />
      </section>
    </div>
  );
}
