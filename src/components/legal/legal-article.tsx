/**
 * Shared shell for legal/policy pages: a readable, semantic <article> with
 * consistent heading/spacing styles (no typography plugin dependency).
 */
export function LegalArticle({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <article
        className={[
          "space-y-4",
          "[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mt-6 [&_h3]:font-medium",
          "[&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground",
          "[&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
          "[&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline",
        ].join(" ")}
      >
        <header className="space-y-2 border-b pb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="text-sm text-muted-foreground">Effective date: {updated}</p>
        </header>
        {children}
      </article>
    </div>
  );
}
