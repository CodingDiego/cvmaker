import { FileQuestion } from "lucide-react";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { getLocale, getT } from "@/i18n/server";

export default async function AuthNotFound() {
  const t = await getT(await getLocale());

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border bg-background/60 text-muted-foreground">
        <FileQuestion className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h1 className="font-display text-xl font-semibold">{t("states.auth.notFoundTitle")}</h1>
        <p className="text-sm text-pretty text-muted-foreground">{t("states.auth.notFoundDescription")}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button className="w-full" render={<Link href="/login" />}>
          {t("states.auth.login")}
        </Button>
        <Button className="w-full" variant="outline" render={<Link href="/" />}>
          {t("states.notFound.home")}
        </Button>
      </div>
    </div>
  );
}
