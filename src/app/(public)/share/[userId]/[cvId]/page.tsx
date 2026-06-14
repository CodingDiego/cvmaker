import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Download, FileText, FileType, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScaledResume } from "@/components/templates/scaled-resume";
import { getPublicCv } from "@/lib/cv/share-service";
import { getTemplate } from "@/templates/registry";

type Params = Promise<{ userId: string; cvId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection()
  console.log("[generateMetadata] enter");
  const { userId, cvId } = await params;
  console.log("[generateMetadata] params resolved", { userId, cvId });
  const cv = await getPublicCv(userId, cvId);
  console.log("[generateMetadata] cv fetched", { userId, cvId, found: Boolean(cv) });
  if (!cv) return {};

  const name = cv.data.header?.fullName || cv.title || "Resume";
  const role = cv.data.header?.title;
  const title = role ? `${name} - ${role}` : name;
  const description =
    cv.data.summary?.trim() ||
    `${name}'s resume${role ? `, ${role}` : ""} - built with CVMaker.`;
  const canonical = `/share/${userId}/${cvId}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    // Public, but a personal resume — keep it out of the index.
    robots: { index: false, follow: true },
  };
}

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
  console.log("[ShareContent] enter");
  const { userId, cvId } = await params;
  console.log("[ShareContent] params resolved", { userId, cvId });
  const cv = await getPublicCv(userId, cvId);
  console.log("[ShareContent] cv fetched", { userId, cvId, found: Boolean(cv) });
  if (!cv) notFound();

  const tokens = getTemplate(cv.templateId);
  const name = cv.data.header?.fullName || cv.title;

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button variant="ghost" size="sm" className="-ml-2 h-9" render={<Link href="/" />}>
              <Home className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" aria-hidden />
            <div className="min-w-0">
              <div className="truncate font-display text-base font-semibold sm:text-lg">{name}</div>
              {cv.data.header?.title && (
                <div className="truncate text-xs text-muted-foreground">{cv.data.header.title}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden h-9 sm:inline-flex" render={<Link href="/templates" />}>
              Templates
            </Button>
            {cv.publicPdfUrl && (
              <Button
                size="sm"
                className="h-9"
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
                className="h-9"
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
