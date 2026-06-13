import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/components/link";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription, payment methods and invoices.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Polar customer portal
          </CardTitle>
          <CardDescription>
            Billing changes are handled securely in Polar. After changes complete, webhook events keep your account in sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/api/portal" />}>
            Open billing portal <ExternalLink className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
