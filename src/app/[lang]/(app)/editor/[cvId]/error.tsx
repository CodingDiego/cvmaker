"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import { useT } from "@/i18n/provider";

// The editor owns the full viewport (no header/footer chrome), so its error
// state is a full screen with a route back to the dashboard.
export default function EditorError({
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
      icon={<AlertTriangle className="size-7" />}
      title={t("states.editor.errorTitle")}
      description={t("states.editor.errorDescription")}
    >
      <Button onClick={() => unstable_retry()}>
        <RefreshCw />
        {t("states.editor.retry")}
      </Button>
      <Button variant="outline" render={<Link href="/dashboard" />}>
        <ArrowLeft />
        {t("states.editor.back")}
      </Button>
    </StatusScreen>
  );
}
