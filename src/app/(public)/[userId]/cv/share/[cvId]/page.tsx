import { Suspense } from "react";
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

// Dynamic metadata: it reads `params` and the (cached) CV, so under Cache
// Components it defers to request time. The doc-sanctioned way to allow that on
// an otherwise-prerenderable route is to co-locate `generateMetadata` with a
// dynamic marker in the SAME route segment — here, the `await connection()`
// inside <Suspense> in `ShareContent` below. That marker tells Next the route's
// dynamic rendering is intentional, so the metadata streams in (rather than
// failing the build with next-prerender-dynamic-metadata) while the surrounding
// shell still prerenders. `getPublicCv` is itself `use cache`, so calling it
// here and again in `ShareContent` hits the same cached row, not the DB twice.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userId, cvId } = await params;
  const cv = await getPublicCv(userId, cvId);
  if (!cv) return { title: "Shared CV", robots: { index: false } };

  const name = cv.data.header?.fullName || cv.title;
  const role = cv.data.header?.title;
  return {
    title: role ? `${name} - ${role}` : name,
    description: `${name}'s resume, shared via CVMaker.`,
    robots: { index: false },
  };
}

// The page reads dynamic `params` to pick the CV, which makes its content
// request-time. We keep that read inside a Suspense boundary so the route still
// produces a static shell (the background + footer below). Under Cache
// Components, having a static shell is what lets Next reconcile the metadata —
// which is necessarily dynamic on a `[userId]/[cvId]` route — without bailing
// the whole build (next-prerender-dynamic-metadata).
export default function SharedCvPage({ params }: { params: Params }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35]" />

      <Suspense fallback={<div className="flex-1" aria-hidden />}>
        <ShareContent params={params} />
      </Suspense>

      <footer className="border-t">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-muted-foreground">
            Built with <span className="font-display font-semibold text-foreground">CVMaker</span> - free ATS-friendly resumes.
          </p>
          <Button variant="outline" size="sm" render={<Link href="/templates" />}>
            <Download className="size-4 rotate-180" /> Make your own
          </Button>
        </div>
      </footer>
    </div>
  );
}

async function ShareContent({ params }: { params: Params }) {
  // Explicit dynamic marker: tells Cache Components this subtree renders at
  // request time, which sets the route's "allowed dynamic" flag so the dynamic
  // metadata on this `[userId]/[cvId]` route doesn't fail the build. (Reading
  // `params` alone doesn't flip that flag.) It's already inside <Suspense>, so
  // the static shell still prerenders.
  await connection();
  const { userId, cvId } = await params;
  const cv = await getPublicCv(userId, cvId);
  if (!cv) notFound();

  const tokens = getTemplate(cv.templateId);
  const name = cv.data.header?.fullName || cv.title;

  return (
    <>
      <JsonLd data={personLd(cv.data, { url: shareUrlFor(userId, cvId) })} />

      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-semibold">{name}</div>
          {cv.data.header?.title && (
            <div className="truncate text-xs text-muted-foreground">{cv.data.header.title}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cv.publicPdfUrl && (
            <Button
              size="sm"
              render={
                <a
                  href={cv.publicPdfUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  download
                />
              }
            >
              <FileText className="size-4" /> <span className="hidden sm:inline">Download</span> PDF
            </Button>
          )}
          {cv.publicDocxUrl && (
            <Button
              size="sm"
              variant="outline"
              render={
                <a
                  href={cv.publicDocxUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  download
                />
              }
            >
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
    </>
  );
}
