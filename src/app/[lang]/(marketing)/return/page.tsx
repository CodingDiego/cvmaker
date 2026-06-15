import type { Metadata } from "next";
import { ArrowLeft, CreditCard, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/link";

export const metadata: Metadata = {
  title: "Checkout paused",
  description: "Return from Polar checkout to Free CV.",
  robots: { index: false, follow: false },
};

const returnUrl = "https://free-cv.com/return";

export default function ReturnPage() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-glow" />
      <section aria-labelledby="checkout-paused-title" className="mx-auto flex min-h-[calc(100svh-14rem)] max-w-4xl items-center px-4 py-16 sm:px-6">
        <Card className="w-full rounded-2xl">
          <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <ArrowLeft className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Polar checkout</p>
                <h1 id="checkout-paused-title" className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Checkout paused
                </h1>
                <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
                  You returned before completing payment. No subscription was activated and no
                  billing change was applied.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" render={<Link href="/api/checkout" />}>
                  <CreditCard className="size-4" /> Resume checkout
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/templates" />}>
                  <FileText className="size-4" /> Browse templates
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 text-primary" />
                <div>
                  <h2 className="font-medium">Polar configuration</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Set this as the Checkout Link return URL. Polar will show a back button that
                    returns users here.
                  </p>
                </div>
              </div>

              <code className="block break-all rounded-md bg-background px-3 py-2 font-mono text-sm text-foreground">
                {returnUrl}
              </code>

              <p className="text-sm text-muted-foreground">
                Billing address collection is configured in Polar checkout settings, not in this
                return page.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
