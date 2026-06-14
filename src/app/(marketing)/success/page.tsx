import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/link";
import { polarCheckoutIdFromSearchParams } from "@/lib/polar-success";
import { loadPolarSuccessState } from "@/lib/polar-success-server";
import { applyPolarCheckout } from "@/lib/billing/polar-checkout-server";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const toneStyles = {
  success: {
    icon: CheckCircle2,
    badge: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
    iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  info: {
    icon: Clock3,
    badge: "bg-primary/10 text-primary ring-primary/20",
    iconWrap: "bg-primary/10 text-primary",
  },
  warning: {
    icon: AlertTriangle,
    badge: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
    iconWrap: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  danger: {
    icon: XCircle,
    badge: "bg-destructive/10 text-destructive ring-destructive/20",
    iconWrap: "bg-destructive/10 text-destructive",
  },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const checkoutId = polarCheckoutIdFromSearchParams(params);

  // Grant Pro instantly on return from checkout (idempotent + ownership-checked
  // + anti-replay). The webhook still reconciles as the source of truth.
  const user = await getCurrentUser();
  if (checkoutId && user) {
    try {
      await applyPolarCheckout(checkoutId, user);
    } catch (error) {
      console.error("[polar] success checkout apply failed", { checkoutId, error });
    }
  }

  const state = await loadPolarSuccessState(checkoutId);
  const tone = toneStyles[state.tone];
  const Icon = tone.icon;

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-glow" />
      <div className="mx-auto flex min-h-[calc(100svh-14rem)] max-w-3xl items-center px-4 py-16 sm:px-6">
        <Card className="w-full rounded-2xl">
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", tone.iconWrap)}>
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge className={cn("mb-4 ring-1", tone.badge)}>
                  {state.kind.replaceAll("-", " ")}
                </Badge>
                <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {state.title}
                </h1>
                <p className="mt-3 text-pretty text-muted-foreground">{state.description}</p>
              </div>
            </div>

            {state.checkoutId && (
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Polar checkout ID
                </p>
                <p className="mt-1 break-all font-mono text-sm">{state.checkoutId}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              {state.kind === "needs-retry" ? (
                <Button size="lg" render={<Link href="/api/checkout" />}>
                  <CreditCard className="size-4" /> Try checkout again
                </Button>
              ) : (
                <Button size="lg" render={<Link href="/dashboard" />}>
                  Go to dashboard <ArrowRight className="size-4" />
                </Button>
              )}
              <Button size="lg" variant="outline" render={<Link href="/dashboard/billing" />}>
                Manage billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
