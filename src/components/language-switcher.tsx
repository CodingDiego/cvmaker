"use client";

import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/provider";

/**
 * Absolute URL for the same path on a different locale's subdomain. The locale
 * lives in the host now, so switching language is a cross-origin navigation
 * (`en.host/x` → `https://es.host/x`) — not a client-side route transition.
 * Strips any existing locale subdomain, then prefixes the target's. Computed at
 * click time so there's no SSR `window` access / hydration mismatch.
 */
function localeHostUrl(target: Locale): string {
  const { protocol, host, pathname, search, hash } = window.location;
  const bareHost = host.replace(/^(?:en|es|pt)\./, ""); // free-cv.com | localhost:3000
  return `${protocol}//${target}.${bareHost}${pathname}${search}${hash}`;
}

export function LanguageSwitcher() {
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
          <DropdownMenuItem
            key={l}
            onClick={() => {
              if (l !== current) window.location.assign(localeHostUrl(l));
            }}
          >
            <Check className={l === current ? "size-4 opacity-100" : "size-4 opacity-0"} />
            {localeLabels[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
