import type { Metadata } from "next";
import { ArrowLeft, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/link";

export const metadata: Metadata = {
  title: "Checkout paused",
  description: "Return from Polar checkout to CVMaker.",
};

export default function ReturnPage() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-glow" />
      <div className="mx-auto flex min-h-[calc(100svh-14rem)] max-w-3xl items-center px-4 py-16 sm:px-6">
        <Card className="w-full rounded-2xl">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ArrowLeft className="size-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Checkout paused
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
                You returned from Polar before completing checkout. No payment was confirmed and no billing change was applied.
              </p>
            </div>

            <div className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
              Configure your Polar Checkout Link return URL as:
              <code className="mt-2 block break-all rounded-md bg-muted px-3 py-2 font-mono text-foreground">
                https://your-domain.com/return
              </code>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/api/checkout" />}>
                <CreditCard className="size-4" /> Resume checkout
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/templates" />}>
                <FileText className="size-4" /> Browse templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
