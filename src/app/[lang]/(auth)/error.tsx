"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/provider";

// The auth layout already centers its child in a max-w-sm column, so this is a
// compact card-sized state rather than a full-screen one.
export default function AuthError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border bg-background/60 text-muted-foreground">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h1 className="font-display text-xl font-semibold">{t("states.auth.errorTitle")}</h1>
        <p className="text-sm text-pretty text-muted-foreground">{t("states.auth.errorDescription")}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button className="w-full" onClick={() => unstable_retry()}>
          <RefreshCw />
          {t("states.error.retry")}
        </Button>
        <Button className="w-full" variant="outline" render={<Link href="/login" />}>
          {t("states.auth.login")}
        </Button>
      </div>
    </div>
  );
}
