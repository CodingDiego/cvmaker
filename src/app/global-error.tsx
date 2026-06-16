"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import "./globals.css";

// Last-resort boundary: replaces the root layout when [lang]/layout itself
// throws, so it must render its own <html>/<body> and cannot rely on the i18n
// provider or font loaders (font loaders are disallowed in Client Components).
// Copy is English-only by necessity; globals.css still themes colors/background.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full border bg-background/60 text-muted-foreground">
              <AlertTriangle className="size-7" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Something went wrong
            </h1>
            <p className="text-sm text-pretty text-muted-foreground sm:text-base">
              A critical error stopped the app from loading. Please reload the page to continue.
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <RefreshCw className="size-4" />
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
