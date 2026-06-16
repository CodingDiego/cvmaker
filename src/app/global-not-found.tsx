import type { Metadata } from "next";
import { FileQuestion } from "lucide-react";
import { display, sans } from "@/lib/fonts";
import { buttonVariants } from "@/components/ui/button";
import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { makeTranslator } from "@/i18n/translate";
import "./globals.css";

// The root layout lives in the top-level dynamic segment [lang], so a consistent
// 404 for URLs that match no route can't be composed from layout + not-found.
// global-not-found (enabled via experimental.globalNotFound) renders its own full
// document. It bypasses normal rendering, so it self-imports styles and fonts.
// Links are plain anchors to the default locale since the app <Link> needs client
// context this page doesn't provide.

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default async function GlobalNotFound() {
  const t = makeTranslator(await getDictionary(defaultLocale));

  return (
    <html lang={defaultLocale} className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <main className="relative flex min-h-svh flex-col items-center justify-center px-4 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35]" />
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <div className="relative flex size-14 items-center justify-center rounded-full border bg-background/60 text-muted-foreground">
              <FileQuestion className="size-7" />
              <span className="absolute -top-2 -right-2 rounded-full border bg-background px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-muted-foreground">
                {t("states.notFound.code")}
              </span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-balance sm:text-3xl">
              {t("states.notFound.title")}
            </h1>
            <p className="text-sm text-pretty text-muted-foreground sm:text-base">
              {t("states.notFound.description")}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <a href={`/${defaultLocale}`} className={buttonVariants()}>
                {t("states.notFound.home")}
              </a>
              <a href={`/${defaultLocale}/templates`} className={buttonVariants({ variant: "outline" })}>
                {t("states.notFound.templates")}
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
