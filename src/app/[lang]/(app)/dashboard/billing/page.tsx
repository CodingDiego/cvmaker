import { CreditCard, Crown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/link";
import { requireUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/billing/entitlements-server";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ portal?: string }>;
}) {
  const user = await requireUser("/dashboard/billing");
  const plan = await getUserPlan(user.id);
  const isPro = plan === "pro";
  const portalUnavailable = (await searchParams).portal === "unavailable";

  return (
    <section aria-labelledby="billing-title" className="space-y-6">
      <header>
        <h1 id="billing-title" className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription, payment methods and invoices.</p>
      </header>

      {portalUnavailable && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          We couldn&apos;t open the billing portal right now. Please try again in a
          moment, or contact support if this keeps happening.
        </div>
      )}

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
    </section>
  );
}
