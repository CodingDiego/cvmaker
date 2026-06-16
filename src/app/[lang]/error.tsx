"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import { useT } from "@/i18n/provider";

// Catch-all error boundary for the localized app. Errors thrown in any segment
// without its own error.tsx bubble up here (but not errors in [lang]/layout
// itself — those go to global-error.tsx).
export default function LocaleError({
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
    <StatusScreen
      code={t("states.error.code")}
      icon={<AlertTriangle className="size-7" />}
      title={t("states.error.title")}
      description={t("states.error.description")}
    >
      <Button onClick={() => unstable_retry()}>
        <RefreshCw />
        {t("states.error.retry")}
      </Button>
      <Button variant="outline" render={<Link href="/" />}>
        <Home />
        {t("states.error.home")}
      </Button>
    </StatusScreen>
  );
}
