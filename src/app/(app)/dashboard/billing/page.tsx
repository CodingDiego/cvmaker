import { CreditCard, Crown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/link";
import { requireUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/billing/entitlements-server";

export default async function BillingPage() {
  const user = await requireUser("/dashboard/billing");
  const plan = await getUserPlan(user.id);
  const isPro = plan === "pro";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription, payment methods and invoices.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5" />
            Your plan
            <Badge variant={isPro ? "default" : "secondary"}>{isPro ? "Pro" : "Free"}</Badge>
          </CardTitle>
          <CardDescription>
            {isPro
              ? "You're on Pro — all premium templates and unlimited drafts are unlocked."
              : "Upgrade to Pro to unlock premium templates and unlimited CV drafts."}
          </CardDescription>
        </CardHeader>
        {!isPro && (
          <CardContent>
            <Button render={<Link href="/api/checkout" />}>
              <Crown className="size-4" /> Upgrade to Pro
            </Button>
          </CardContent>
        )}
      </Card>

      {isPro && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Polar customer portal
            </CardTitle>
            <CardDescription>
              Manage your subscription, payment methods and invoices securely in Polar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/api/portal" />}>
              Open billing portal <ExternalLink className="size-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
