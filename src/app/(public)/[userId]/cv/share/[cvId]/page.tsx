import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileText, FileType } from "lucide-react";
import { getPublicCv, shareUrlFor } from "@/lib/cv/share-service";
import { getTemplate } from "@/templates/registry";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScaledResume } from "@/components/templates/scaled-resume";
import { JsonLd } from "@/components/seo/json-ld";
import { personLd } from "@/lib/seo";

type Params = Promise<{ userId: string; cvId: string }>;

// Metadata reads `params` and the CV. Under Cache Components that would defer to
// request time and, since the page body prerenders a shell, fail the build with
// next-prerender-dynamic-metadata. We mark it `'use cache'`: `params` serialize
// into the cache key (one entry per user/CV) and `getPublicCv` is itself cached,
// so the metadata becomes prerenderable — no runtime/auth data is involved here.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  "use cache";
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
// produces a static shell (the background + footer below). Because the metadata
// is also dynamic on this `[userId]/[cvId]` route, Next needs the route to
// "allow dynamic" or the build bails (next-prerender-dynamic-metadata).
//
// That flag is only set when a dynamic marker sits under a <Suspense> that is
// itself directly under the route body — with NO DOM element in between. So the
// marker can't live inside the page's wrapping <div>; it has to be hoisted to a
// direct child of the top-level fragment, above any element. Hence the dedicated
// <DynamicMarker /> below rather than an `await connection()` buried in
// `ShareContent` (which is wrapped by the layout <div> and so wouldn't count).
export default function SharedCvPage({ params }: { params: Params }) {
  return (
    <>
      <DynamicMarker />

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
    </>
  );
}

// Renders nothing; the `await connection()` inside a <Suspense> that is a direct
// child of the page's top-level fragment is what flips the route's "allowed
// dynamic" flag, letting the dynamic metadata stream while the shell prerenders.
const Connection = async () => {
  await connection();
  return null;
};

function DynamicMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}

async function ShareContent({ params }: { params: Params }) {
  // Request-time content: reading `params` defers this subtree to request time.
  // It's inside its own <Suspense>, so the surrounding shell still prerenders.
  // (The "allowed dynamic" flag is set by <DynamicMarker /> above, not here.)
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
