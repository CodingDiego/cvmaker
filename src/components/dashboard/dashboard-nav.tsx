"use client";

import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { CreditCard, FileText, Images, MonitorSmartphone, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "My CVs", icon: FileText, exact: true },
  { href: "/dashboard/assets", label: "Assets", icon: Images },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/sessions", label: "Sessions", icon: MonitorSmartphone },
  { href: "/dashboard/security", label: "Security", icon: ShieldCheck },
  { href: "/dashboard/account", label: "Account", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
