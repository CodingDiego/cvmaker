import { FileQuestion } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import { getLocale, getT } from "@/i18n/server";

// Catch-all 404 for the localized app: notFound() thrown by any page under
// [lang] (and bubbled-up notFound() from nested group layouts) resolves here.
export default async function NotFound() {
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
