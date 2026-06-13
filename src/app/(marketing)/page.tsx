import Link from "next/link";
import { ArrowRight, Check, Files, MoonStar, ScanLine, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/templates/registry";
import { sampleResume } from "@/lib/cv/types";
import { PreviewThumbnail } from "@/components/templates/preview-thumbnail";

const features = [
  {
    icon: ScanLine,
    title: "ATS-optimized",
    description: "Real text, logical order and standard fonts — every template parses cleanly through applicant tracking systems.",
  },
  {
    icon: Files,
    title: "Export anywhere",
    description: "Download as PDF, DOCX, or all formats at once in a single ZIP — rendered server-side.",
  },
  {
    icon: Sparkles,
    title: "10 distinct templates",
    description: "From minimal to executive — switch designs any time without retyping a thing.",
  },
  {
    icon: Share2,
    title: "Share by link",
    description: "Publish your CV to a public link anyone can view and download — toggle it off anytime.",
  },
  {
    icon: MoonStar,
    title: "Live, responsive editor",
    description: "Edit on the left, watch your resume update on the right. Looks great in light or dark.",
  },
];

// A small fanned trio of real template previews for the hero.
const HERO_TEMPLATES = ["executive", "modern-serif", "two-column-ats"] as const;

export default function LandingPage() {
  const sample = sampleResume();

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-glow" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Check className="size-3.5 text-primary" /> Free forever · No watermarks
            </span>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Resumes that get
              <span className="text-primary"> read</span>, not rejected.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-pretty text-muted-foreground">
              Build a polished, ATS-friendly CV in minutes. Ten distinct templates, a live preview, and
              one-click export to PDF, DOCX or a single ZIP.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-11 px-5 text-base" render={<Link href="/templates" />}>
                Browse templates <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5 text-base" render={<Link href="/register" />}>
                Create free account
              </Button>
            </div>
          </div>

          {/* Fanned previews */}
          <div className="relative mx-auto hidden h-[420px] w-full max-w-md lg:block">
            {HERO_TEMPLATES.map((id, i) => {
              const tokens = TEMPLATES.find((t) => t.id === id)!;
              const rotations = ["-rotate-6", "rotate-0", "rotate-6"];
              const offsets = ["left-0 top-8", "left-1/2 top-0 -translate-x-1/2 z-10", "right-0 top-8"];
              return (
                <div
                  key={id}
                  className={`absolute ${offsets[i]} ${rotations[i]} overflow-hidden rounded-lg shadow-2xl ring-1 ring-black/10 transition-transform duration-300 hover:z-20 hover:scale-105`}
                >
                  <PreviewThumbnail data={sample} tokens={tokens} width={190} height={300} />
                </div>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border bg-card/60 p-6 transition-colors hover:border-primary/40 hover:bg-card"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
