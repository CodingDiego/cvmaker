import { CreditCard, Crown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/link";
import { requireUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/billing/entitlements-server";
import { getTFromParams } from "@/i18n/server";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ portal?: string }>;
}) {
  const [user, t] = await Promise.all([requireUser("/dashboard/billing"), getTFromParams(params)]);
  const plan = await getUserPlan(user.id);
  const isPro = plan === "pro";
  const portalUnavailable = (await searchParams).portal === "unavailable";

  return (
    <section aria-labelledby="billing-title" className="space-y-6">
      <header>
        <h1 id="billing-title" className="text-2xl font-semibold">{t("dashboard.billing.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.billing.subtitle")}</p>
      </header>

      {portalUnavailable && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {t("dashboard.billing.portalUnavailable")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5" />
            {t("dashboard.billing.yourPlan")}
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? t("dashboard.billing.pro") : t("dashboard.billing.free")}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isPro
              ? t("dashboard.billing.proDescription")
              : t("dashboard.billing.freeDescription")}
          </CardDescription>
        </CardHeader>
        {!isPro && (
          <CardContent>
            <Button render={<Link href="/api/checkout" />}>
              <Crown className="size-4" /> {t("dashboard.billing.upgrade")}
            </Button>
          </CardContent>
        )}
      </Card>

      {isPro && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              {t("dashboard.billing.portalTitle")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.billing.portalDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/api/portal" />}>
              {t("dashboard.billing.openPortal")} <ExternalLink className="size-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
