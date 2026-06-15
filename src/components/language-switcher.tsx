"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
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
  const current = useLocale();
  const t = useT();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="h-9" aria-label={t("common.language")} />}
      >
        <Globe className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem key={l} render={<NextLink href={withLocale(pathname, l)} prefetch={false} />}>
            <Check className={l === current ? "size-4 opacity-100" : "size-4 opacity-0"} />
            {localeLabels[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
