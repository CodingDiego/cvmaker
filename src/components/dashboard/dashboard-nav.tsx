"use client";

import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { CreditCard, FileText, Images, MonitorSmartphone, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import { isLocale } from "@/i18n/config";

const items = [
  { href: "/dashboard", labelKey: "nav.myCvs", icon: FileText, exact: true },
  { href: "/dashboard/assets", labelKey: "nav.assets", icon: Images, exact: false },
  { href: "/dashboard/billing", labelKey: "nav.billing", icon: CreditCard, exact: false },
  { href: "/dashboard/sessions", labelKey: "nav.sessions", icon: MonitorSmartphone, exact: false },
  { href: "/dashboard/security", labelKey: "nav.security", icon: ShieldCheck, exact: false },
  { href: "/dashboard/account", labelKey: "nav.account", icon: User, exact: false },
] as const;

/** Strip a leading `/en|/es|/pt` segment so active-state checks compare against
 * the locale-agnostic route the nav items are declared with. */
function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1] ?? "";
  if (!isLocale(seg)) return pathname;
  const rest = "/" + pathname.split("/").slice(2).join("/");
  return rest === "/" ? "/" : rest.replace(/\/+$/, "");
}

export function DashboardNav() {
  const t = useT();
  const path = stripLocale(usePathname());
  return (
    <nav aria-label={t("nav.sectionsAria")} className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(({ href, labelKey, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
