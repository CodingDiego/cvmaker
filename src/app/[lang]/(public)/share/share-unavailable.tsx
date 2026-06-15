import { FileQuestion } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";

type Reason = "missing-params" | "not-public";

const COPY: Record<Reason, { title: string; body: string }> = {
  "missing-params": {
    title: "This share link is incomplete",
    body: "The link is missing the information needed to load a resume. Double-check that you copied the full URL.",
  },
  "not-public": {
    title: "This resume isn’t available",
    body: "It may have been unshared, deleted, or the link is no longer valid. Only resumes their owner has published can be viewed here.",
  },
};

/** Friendly, public-facing state for a share link that can't resolve to a CV. */
export function ShareUnavailable({ reason }: { reason: Reason }) {
  const { title, body } = COPY[reason];

  return (
    <main
      id="main-content"
      className="relative flex min-h-svh flex-col items-center justify-center px-4 text-center"
      tabIndex={-1}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35]" />

      <div className="flex max-w-md flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full border bg-background/60">
          <FileQuestion className="size-7 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{body}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button render={<Link href="/" />}>Go home</Button>
          <Button variant="outline" render={<Link href="/templates" />}>
            Make your own resume
          </Button>
        </div>
      </div>
    </main>
  );
}
