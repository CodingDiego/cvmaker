import { FileQuestion } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import { getLocale, getT } from "@/i18n/server";

export default async function MarketingNotFound() {
  const t = await getT(await getLocale());

  return (
    <StatusScreen
      code={t("states.notFound.code")}
      icon={<FileQuestion className="size-7" />}
      title={t("states.notFound.title")}
      description={t("states.notFound.description")}
    >
      <Button render={<Link href="/" />}>{t("states.notFound.home")}</Button>
      <Button variant="outline" render={<Link href="/templates" />}>
        {t("states.notFound.templates")}
      </Button>
    </StatusScreen>
  );
}
