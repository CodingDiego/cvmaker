import { FileQuestion } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import { getLocale, getT } from "@/i18n/server";

export default async function DashboardNotFound() {
  const t = await getT(await getLocale());

  return (
    <StatusScreen
      variant="panel"
      code={t("states.notFound.code")}
      icon={<FileQuestion className="size-7" />}
      title={t("states.dashboard.notFoundTitle")}
      description={t("states.dashboard.notFoundDescription")}
    >
      <Button render={<Link href="/dashboard" />}>{t("states.dashboard.back")}</Button>
    </StatusScreen>
  );
}
