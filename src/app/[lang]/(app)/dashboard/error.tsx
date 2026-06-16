"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import { useT } from "@/i18n/provider";

// Renders inside the dashboard content column (header + sidebar stay), so this
// uses the dashed-panel variant rather than a full screen.
export default function DashboardError({
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
      variant="panel"
      icon={<AlertTriangle className="size-7" />}
      title={t("states.dashboard.errorTitle")}
      description={t("states.dashboard.errorDescription")}
    >
      <Button onClick={() => unstable_retry()}>
        <RefreshCw />
        {t("states.error.retry")}
      </Button>
      <Button variant="outline" render={<Link href="/dashboard" />}>
        {t("states.dashboard.back")}
      </Button>
    </StatusScreen>
  );
}
