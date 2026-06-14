import { requireUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function AccountPage() {
  const user = await requireUser("/dashboard/account");

  return (
    <section aria-labelledby="account-title" className="space-y-6">
      <header>
        <h1 id="account-title" className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your profile information.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm email={user.email} name={user.name} />
        </CardContent>
      </Card>
    </section>
  );
}
