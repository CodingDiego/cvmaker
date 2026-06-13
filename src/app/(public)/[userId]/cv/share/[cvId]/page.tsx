import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Download, FileText, FileType } from "lucide-react";
import { getPublicCv, shareUrlFor } from "@/lib/cv/share-service";
import { getTemplate } from "@/templates/registry";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScaledResume } from "@/components/templates/scaled-resume";
import { JsonLd } from "@/components/seo/json-ld";
import { personLd } from "@/lib/seo";

type Params = Promise<{ userId: string; cvId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();
  const { userId, cvId } = await params;
  const cv = await getPublicCv(userId, cvId);
  if (!cv) return { title: "CV not found", robots: { index: false } };
  const name = cv.data.header?.fullName || cv.title;
  const description = cv.data.header?.title || "Shared resume";
  const url = shareUrlFor(userId, cvId);
  return {
    title: `${name} — CV`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "profile", title: `${name} — CV`, description, url },
    twitter: { card: "summary", title: `${name} — CV`, description },
  };
}

export default async function SharedCvPage({ params }: { params: Params }) {
  await connection();
  const { userId, cvId } = await params;
  const cv = await getPublicCv(userId, cvId);
  if (!cv) notFound();

  const tokens = getTemplate(cv.templateId);
  const name = cv.data.header?.fullName || cv.title;

  return (
    <div className="relative flex min-h-svh flex-col">
      <JsonLd data={personLd(cv.data, { url: shareUrlFor(userId, cvId) })} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35]" />

      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-semibold">{name}</div>
          {cv.data.header?.title && (
            <div className="truncate text-xs text-muted-foreground">{cv.data.header.title}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cv.publicPdfUrl && (
            <Button size="sm" render={<a href={cv.publicPdfUrl} target="_blank" rel="noreferrer noopener" download />}>
              <FileText className="size-4" /> <span className="hidden sm:inline">Download</span> PDF
            </Button>
          )}
          {cv.publicDocxUrl && (
            <Button size="sm" variant="outline" render={<a href={cv.publicDocxUrl} target="_blank" rel="noreferrer noopener" download />}>
              <FileType className="size-4" /> DOCX
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <ScaledResume
          data={cv.data}
          tokens={tokens}
          accentColor={cv.accentColor}
          fontFamily={cv.fontFamily}
        />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-muted-foreground">
            Built with <span className="font-display font-semibold text-foreground">CVMaker</span> — free ATS-friendly resumes.
          </p>
          <Button variant="outline" size="sm" render={<Link href="/templates" />}>
            <Download className="size-4 rotate-180" /> Make your own
          </Button>
        </div>
      </footer>
    </div>
  );
}
