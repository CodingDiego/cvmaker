import { cn } from "@/lib/utils";

type StatusScreenVariant = "full" | "panel";

/**
 * Shared presentational shell for full-page status states — 404s, error
 * boundaries, empty/unavailable screens. Pure JSX (no hooks), so it can be
 * imported by both Server Components (`not-found.tsx`) and Client Components
 * (`error.tsx`). Mirrors the look of the public share-unavailable screen.
 *
 *  - `full`  centers in the viewport with a subtle grid backdrop (top-level
 *            boundaries that own the whole screen).
 *  - `panel` fills a content area inside existing chrome (dashboard/editor),
 *            rendered as a dashed card like the Empty component.
 */
export function StatusScreen({
  icon,
  code,
  title,
  description,
  children,
  variant = "full",
  className,
}: {
  icon: React.ReactNode;
  code?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  variant?: StatusScreenVariant;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center px-4 py-16 text-center",
        variant === "full" ? "min-h-svh" : "min-h-[60vh] w-full rounded-xl border border-dashed",
        className,
      )}
    >
      {variant === "full" ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35]" />
      ) : null}

      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <div className="relative flex size-14 items-center justify-center rounded-full border bg-background/60 text-muted-foreground">
          {icon}
          {code ? (
            <span className="absolute -top-2 -right-2 rounded-full border bg-background px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-muted-foreground">
              {code}
            </span>
          ) : null}
        </div>
        <h1 className="font-display text-2xl font-semibold text-balance sm:text-3xl">{title}</h1>
        <p className="text-sm text-pretty text-muted-foreground sm:text-base">{description}</p>
        {children ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
