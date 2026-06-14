import { Link } from "@/components/link";
import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Layers3,
  Lock,
  ScanLine,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewThumbnail } from "@/components/templates/preview-thumbnail";
import { sampleResume } from "@/lib/cv/types";
import { organizationLd, softwareApplicationLd, websiteLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { TEMPLATES } from "@/templates/registry";

const HERO_TEMPLATES = ["executive", "modern-serif", "two-column-ats"] as const;
const GALLERY_TEMPLATES = ["classic", "professional", "technical", "rose-editorial"] as const;

const outcomes = [
  { value: "PDF", label: "clean, selectable text" },
  { value: "DOCX", label: "editable Word export" },
  { value: "ZIP", label: "one click for every format" },
];

const workflow = [
  {
    icon: Layers3,
    title: "Pick the structure",
    description: "Start from ATS-safe templates with real layout differences, not just color swaps.",
  },
  {
    icon: Sparkles,
    title: "Edit once",
    description: "Your sections, ordering, accent color and typography stay reusable across designs.",
  },
  {
    icon: Download,
    title: "Export directly",
    description: "Download PDF, DOCX or ZIP from the editor without waiting on a background queue.",
  },
];

const trust = [
  {
    icon: ScanLine,
    title: "ATS first",
    description: "Every export keeps the resume as selectable text with predictable section hierarchy.",
  },
  {
    icon: Share2,
    title: "Shareable links",
    description: "Publish a public CV page with navigation, downloads and a fast reader-friendly preview.",
  },
  {
    icon: Lock,
    title: "Private drafts",
    description: "Your working drafts stay behind your account until you explicitly publish them.",
  },
];

function template(id: string) {
  return TEMPLATES.find((item) => item.id === id)!;
}

export default function LandingPage() {
  const sample = sampleResume();

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={organizationLd()} />
      <JsonLd data={websiteLd()} />
      <JsonLd data={softwareApplicationLd()} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]" />

      <section className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:py-16">
        <div className="max-w-xl">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Check className="size-3.5 text-primary" /> Free forever. No watermarks.
          </span>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-balance sm:text-6xl">
            CVMaker
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-pretty text-muted-foreground">
            Build an ATS-friendly CV that still looks designed. Edit your draft once, switch templates freely,
            then download the exact file format you need.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="h-11 px-5 text-base" render={<Link href="/templates" />}>
              Choose a template <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-5 text-base" render={<Link href="/register" />}>
              Create free account
            </Button>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 divide-x rounded-lg border bg-background/80">
            {outcomes.map((item) => (
              <div key={item.value} className="px-4 py-3">
                <div className="font-display text-lg font-semibold">{item.value}</div>
                <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[430px] overflow-hidden rounded-lg border bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_80%,transparent),color-mix(in_oklch,var(--background)_70%,var(--primary)_6%))] p-4 shadow-sm sm:min-h-[520px] sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-destructive" />
              <span className="size-2 rounded-full bg-chart-3" />
              <span className="size-2 rounded-full bg-primary" />
            </div>
            <span>Live template preview</span>
          </div>

          <div className="relative h-[360px] sm:h-[440px]">
            {HERO_TEMPLATES.map((id, index) => {
              const positions = [
                "left-0 top-12 -rotate-6",
                "left-1/2 top-0 z-10 -translate-x-1/2 rotate-0",
                "right-0 top-16 rotate-6",
              ];
              const widths = [172, 210, 172];
              return (
                <div
                  key={id}
                  className={`absolute ${positions[index]} overflow-hidden rounded-md border bg-white shadow-xl transition-transform duration-300 hover:z-20 hover:-translate-y-1`}
                >
                  <PreviewThumbnail data={sample} tokens={template(id)} width={widths[index]} height={300} />
                </div>
              );
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {["ATS-safe text", "Editable exports", "Public sharing"].map((label) => (
              <div key={label} className="rounded-md border bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-secondary/45">
        <div className="mx-auto grid max-w-6xl gap-0 px-4 py-12 sm:px-6 lg:grid-cols-3">
          {workflow.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="relative border-b py-6 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border">
                  <Icon className="size-4" />
                </span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Step {index + 1}</span>
              </div>
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-display text-3xl font-semibold text-balance">A resume builder that respects the file at the end.</h2>
          <p className="mt-4 max-w-md leading-7 text-muted-foreground">
            The editor is useful only if the final download is reliable. CVMaker keeps export formats visible,
            direct and consistent with the preview.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {trust.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border bg-background p-5">
              <Icon className="mb-5 size-5 text-primary" />
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold">Template range</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Conservative, technical, executive and editorial layouts share one draft model.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/templates" />}>
            See all templates <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY_TEMPLATES.map((id) => {
            const tokens = template(id);
            return (
              <Link key={id} href="/templates" className="group rounded-lg border bg-background p-3 transition-colors hover:border-primary/50">
                <div className="overflow-hidden rounded-md border bg-white">
                  <PreviewThumbnail data={sample} tokens={tokens} width={220} height={180} />
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
    </div>
  );
}
