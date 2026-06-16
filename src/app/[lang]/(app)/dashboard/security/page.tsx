import { Link } from "@/components/link";
import { MailCheck, MailWarning } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TwoFactorSetup } from "@/components/dashboard/two-factor-setup";
import { getTFromParams } from "@/i18n/server";

export default async function SecurityPage({ params }: { params: Promise<{ lang: string }> }) {
  const [user, t] = await Promise.all([requireUser("/dashboard/security"), getTFromParams(params)]);

  return (
    <section aria-labelledby="security-title" className="space-y-6">
      <header>
        <h1 id="security-title" className="text-2xl font-semibold">{t("dashboard.security.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.security.subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {user.emailVerified ? (
                <MailCheck className="size-5" />
              ) : (
                <MailWarning className="size-5 text-amber-500" />
              )}
              {t("dashboard.security.emailVerification")}
            </CardTitle>
            <Badge variant={user.emailVerified ? "default" : "secondary"}>
              {user.emailVerified ? t("dashboard.security.verified") : t("dashboard.security.unverified")}
            </Badge>
          </div>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        {!user.emailVerified && (
          <CardContent>
            <Button variant="outline" render={<Link href="/verify" />}>
              {t("dashboard.security.verifyEmail")}
            </Button>
          </CardContent>
        )}
      </Card>

      <TwoFactorSetup enabled={user.twoFactorEnabled} />
    </section>
  );
}
