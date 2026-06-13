import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Files,
  MoonStar,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ScanLine,
    title: "ATS-optimized",
    description: "Every template uses real text, logical order and standard fonts so applicant tracking systems parse them cleanly.",
  },
  {
    icon: Files,
    title: "Export anywhere",
    description: "Download as PDF, DOCX, or all formats at once in a single ZIP — generated server-side.",
  },
  {
    icon: FileText,
    title: "10 templates",
    description: "From minimal to executive, pick a design and switch any time without losing content.",
  },
  {
    icon: ShieldCheck,
    title: "Secure account",
    description: "Hybrid sessions, 2FA, and a sessions dashboard so you always know who's signed in.",
  },
  {
    icon: MoonStar,
    title: "Light & dark",
    description: "A responsive editor with live preview that looks great on any device, day or night.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <Check className="size-3.5 text-primary" /> Free forever · No watermarks
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Build an ATS-friendly resume in minutes
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
          Create, edit and export professional CVs for free. 10 templates, live preview, and exports
          to PDF, DOCX or all formats at once.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link href="/templates" />}>
            Browse templates <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/register" />}>
            Create free account
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border p-6">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
