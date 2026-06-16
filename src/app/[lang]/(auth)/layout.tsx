import type { Metadata } from "next";
import { Link } from "@/components/link";
import { FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in, register, or reset your password.",
  // No blanket robots rule here: /register is an indexable conversion page (it's
  // in the sitemap), while /login, /reset and /verify set their own noindex.
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,var(--muted),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="size-5 text-primary" />
          <span>CVMaker</span>
        </Link>
        <ThemeToggle />
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-8" tabIndex={-1}>
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
