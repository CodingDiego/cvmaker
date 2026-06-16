import { requireUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getTFromParams } from "@/i18n/server";

export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const [user, t] = await Promise.all([requireUser("/dashboard/account"), getTFromParams(params)]);

  return (
    <section aria-labelledby="account-title" className="space-y-6">
      <header>
        <h1 id="account-title" className="text-2xl font-semibold">{t("dashboard.account.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.account.subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.account.profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm email={user.email} name={user.name} />
        </CardContent>
      </Card>
    </section>
  );
}
