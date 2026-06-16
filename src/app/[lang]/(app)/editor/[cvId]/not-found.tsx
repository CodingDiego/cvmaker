import { ArrowLeft, FileQuestion } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/status-screen";
import { getLocale, getT } from "@/i18n/server";

// Reached when the editor page calls notFound() for a missing/inaccessible CV.
export default async function EditorNotFound() {
  const t = await getT(await getLocale());

  return (
    <StatusScreen
      code={t("states.notFound.code")}
      icon={<FileQuestion className="size-7" />}
      title={t("states.editor.notFoundTitle")}
      description={t("states.editor.notFoundDescription")}
    >
      <Button render={<Link href="/dashboard" />}>
        <ArrowLeft />
        {t("states.editor.back")}
      </Button>
    </StatusScreen>
  );
}
