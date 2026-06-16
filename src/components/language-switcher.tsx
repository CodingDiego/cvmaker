"use client";

import { useMemo } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLocale, localeLabels, locales, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/provider";

/** Replace (or insert) the locale segment of the current path. */
function withLocale(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1] ?? "")) {
    parts[1] = target;
  } else {
    parts.splice(1, 0, target);
  }
  return parts.join("/") || `/${target}`;
}

export function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const current = useLocale();
  const t = useT();

  const options = useMemo(
    () => locales.map((l) => ({ locale: l, href: withLocale(pathname, l) })),
    [pathname],
  );

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // Warm the other locales' routes the moment the menu opens, so the
        // switch is instant on click/tap — no hover required (works on touch).
        if (open) {
          for (const { locale, href } of options) {
            if (locale !== current) router.prefetch(href);
          }
        }
      }}
    >
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="h-9" aria-label={t("common.language")} />}
      >
        <Globe className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(({ locale: l, href }) => (
          <DropdownMenuItem key={l} render={<NextLink href={href} prefetch={false} />}>
            <Check className={l === current ? "size-4 opacity-100" : "size-4 opacity-0"} />
            {localeLabels[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
