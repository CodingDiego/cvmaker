import type { Metadata } from "next";
import { Link } from "@/components/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  FileText,
  Layers3,
  Lock,
  ScanLine,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyThumbnail } from "@/components/templates/lazy-thumbnail";
import { sampleResume } from "@/lib/cv/types";
import { faqPageLd, pageMetadata, webPageLd } from "@/lib/seo";
import { faqCopy, faqHeading, seoCopy } from "@/lib/seo-copy";
import { JsonLd } from "@/components/seo/json-ld";
import { TEMPLATES } from "@/templates/registry";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getT } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  return pageMetadata({
    lang: locale,
    path: "/",
    absoluteTitle: true,
    ...seoCopy.home[locale],
  });
}

// Parsed once at module scope — `sampleResume()` runs `resumeSchema.parse(...)`,
// so this avoids re-parsing on every render and shares one object across every
// thumbnail on the page.
const SAMPLE = sampleResume();

const HERO_TEMPLATES = ["executive", "modern-serif", "two-column-ats"] as const;
// Landing showcase uses only free templates so the public/OSS build never
// depends on the private premium overlay being present.
const GALLERY_TEMPLATES = ["classic", "professional", "technical", "modern-serif"] as const;

// Icons stay in code; the copy is pulled from the locale dictionary by index.
const OUTCOMES = [0, 1, 2] as const;
const HERO_BADGES = [0, 1, 2] as const;
const WORKFLOW_ICONS = [Layers3, Sparkles, Download];
const TRUST_ICONS = [ScanLine, Share2, Lock];

function template(id: string) {
  return TEMPLATES.find((item) => item.id === id);
}

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = await getT(locale);

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        id="home-page-json-ld"
        data={webPageLd({
          name: "CVMaker - Free ATS-friendly resume builder",
          description:
            "Build an ATS-friendly CV, switch templates, and export PDF or DOCX files from one reusable draft.",
          path: "/",
        })}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]" />

      <section
        aria-labelledby="home-hero-title"
        className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:py-16"
      >
        <div className="max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium shadow-sm">
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-display font-semibold tracking-tight">CVMaker</span>
            <span aria-hidden className="h-3 w-px bg-border" />
            <span className="text-muted-foreground">{t("home.badge")}</span>
          </span>

          <h1
            id="home-hero-title"
            className="font-display text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-balance sm:text-6xl"
          >
            {t("home.heroTitleA")}
            <span className="relative whitespace-nowrap text-primary">
              {t("home.heroAccent")}
              <svg
                aria-hidden
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-[0.5em] w-full text-primary/35"
              >
                <path d="M2 9 C 80 2, 220 2, 298 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            {t("home.heroTitleB")}
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-pretty text-muted-foreground">
            {t("home.lead")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="h-11 px-5 text-base" render={<Link href="/templates" />}>
              {t("home.chooseTemplate")} <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-5 text-base" render={<Link href="/register" />}>
              {t("home.createAccount")}
            </Button>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {HERO_BADGES.map((i) => (
              <li key={i} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Check className="size-4 text-primary" /> {t(`home.heroBadges.${i}`)}
              </li>
            ))}
          </ul>

          <div className="mt-10 grid max-w-lg grid-cols-3 divide-x rounded-xl border bg-background/80 shadow-sm">
            {OUTCOMES.map((i) => (
              <div key={i} className="px-4 py-3">
                <div className="font-display text-lg font-semibold">{t(`home.outcomes.${i}.value`)}</div>
                <div className="mt-1 text-xs leading-5 text-muted-foreground">{t(`home.outcomes.${i}.label`)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="bg-glow pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-70 blur-2xl"
          />
          <div className="relative min-h-[440px] overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_80%,transparent),color-mix(in_oklch,var(--background)_70%,var(--primary)_6%))] p-4 shadow-xl ring-1 ring-black/5 sm:min-h-[540px] sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-destructive" />
                <span className="size-2 rounded-full bg-chart-3" />
                <span className="size-2 rounded-full bg-primary" />
              </div>
              <span className="flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                {t("home.livePreview")}
              </span>
            </div>

            <div className="relative h-[380px] sm:h-[460px]">
              {HERO_TEMPLATES.map((id, index) => {
                const tokens = template(id);
                if (!tokens) return null;
                const layout = [
                  { pos: "left-0 top-16 -rotate-[8deg] sm:left-2", w: 152, h: 300, z: "z-0", extra: "opacity-95" },
                  { pos: "left-1/2 top-0 -translate-x-1/2", w: 232, h: 340, z: "z-10", extra: "" },
                  { pos: "right-0 top-20 rotate-[8deg] sm:right-2", w: 152, h: 300, z: "z-0", extra: "opacity-95" },
                ][index]!;
                return (
                  <div
                    key={id}
                    className={`absolute ${layout.pos} ${layout.z} ${layout.extra} overflow-hidden rounded-xl border bg-white shadow-2xl ring-1 ring-black/5 transition-transform duration-300 hover:z-20 hover:-translate-y-1.5`}
                  >
                    <LazyThumbnail data={SAMPLE} tokens={tokens} width={layout.w} height={layout.h} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating accent chip */}
          <div className="absolute -bottom-3 -left-3 hidden items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-lg sm:flex">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Download className="size-4" />
            </span>
            <span className="text-xs font-medium">PDF · DOCX · ZIP</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow-title" className="cv-defer border-y bg-secondary/45">
        <h2 id="workflow-title" className="sr-only">
          {t("home.workflowTitle")}
        </h2>
        <div className="mx-auto grid max-w-6xl gap-0 px-4 py-12 sm:px-6 lg:grid-cols-3">
          {WORKFLOW_ICONS.map((Icon, index) => (
            <div key={index} className="relative border-b py-6 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border">
                  <Icon className="size-4" />
                </span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">{t("home.step", { n: index + 1 })}</span>
              </div>
              <h2 className="font-display text-xl font-semibold">{t(`home.workflow.${index}.title`)}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{t(`home.workflow.${index}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="exports-title" className="cv-defer mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 id="exports-title" className="font-display text-3xl font-semibold text-balance">{t("home.exportsTitle")}</h2>
          <p className="mt-4 max-w-md leading-7 text-muted-foreground">
            {t("home.exportsLead")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {TRUST_ICONS.map((Icon, index) => (
            <div key={index} className="rounded-lg border bg-background p-5">
              <Icon className="mb-5 size-5 text-primary" />
              <h3 className="font-display text-base font-semibold">{t(`home.trust.${index}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`home.trust.${index}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="template-range-title" className="cv-defer mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="template-range-title" className="font-display text-3xl font-semibold">{t("home.rangeTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {t("home.rangeLead")}
            </p>
          </div>
          <Button variant="outline" render={<Link href="/templates" />}>
            {t("home.seeAll")} <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY_TEMPLATES.map((id) => {
            const tokens = template(id);
            if (!tokens) return null;
            return (
              <Link key={id} href="/templates" className="group rounded-lg border bg-background p-3 transition-colors hover:border-primary/50">
                <div className="overflow-hidden rounded-md border bg-white">
                  <LazyThumbnail data={SAMPLE} tokens={tokens} width={220} height={180} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{tokens.label}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{tokens.description}</p>
                  </div>
                  <FileText className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="faq-title" className="cv-defer border-t bg-secondary/30">
        <JsonLd id="home-faq-json-ld" data={faqPageLd(faqCopy[locale])} />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 id="faq-title" className="font-display text-3xl font-semibold text-balance">
            {faqHeading[locale]}
          </h2>
          <div className="mt-8 divide-y rounded-lg border bg-background">
            {faqCopy[locale].map((item) => (
              <details
                key={item.q}
                className="group px-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-sm leading-6 text-pretty text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
