import { Link } from "@/components/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { getLocale, getT } from "@/i18n/server";
import type { Locale } from "@/i18n/config";

function Wordmark({ label }: { label: string }) {
  return (
    <Link href="/" aria-label={label} className="group flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6">
        CV
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">CVMaker</span>
    </Link>
  );
}

export async function SiteHeader({ locale }: { locale?: Locale } = {}) {
  const [user, loc] = await Promise.all([getCurrentUser(), locale ? Promise.resolve(locale) : getLocale()]);
  const t = await getT(loc);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Wordmark label={t("header.homeAria")} />

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 text-sm sm:flex">
          <Button variant="ghost" size="sm" render={<Link href="/templates" />}>
            {t("header.templates")}
          </Button>
          {user && (
            <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
              {t("header.dashboard")}
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                {t("header.signIn")}
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                {t("header.getStarted")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
