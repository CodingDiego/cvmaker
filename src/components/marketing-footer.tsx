import { Link } from "@/components/link";
import { FileText } from "lucide-react";

const productLinks = [
  { href: "/templates", label: "Templates" },
  { href: "/register", label: "Create a CV" },
  { href: "/dashboard", label: "Dashboard" },
];

const accountLinks = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Sign up" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">{title}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <FileText className="size-5 text-primary" />
              CVMaker
            </Link>
            <p className="mt-3 text-sm text-pretty text-muted-foreground">
              Free, ATS-friendly resumes. Build, share by link, and export to PDF or DOCX in minutes.
            </p>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Account" links={accountLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; CVMaker. All rights reserved.</p>
          <p>Built for job seekers and the teams hiring them.</p>
        </div>
      </div>
    </footer>
  );
}
