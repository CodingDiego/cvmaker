import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/lib/auth/email";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ResendVerification } from "@/components/auth/resend-verification";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    const ok = await verifyEmailToken(token);
    return (
      <Card>
        <CardHeader>
          {ok ? (
            <CheckCircle2 className="size-8 text-primary" />
          ) : (
            <XCircle className="size-8 text-destructive" />
          )}
          <CardTitle>{ok ? "Email verified" : "Verification failed"}</CardTitle>
          <CardDescription>
            {ok
              ? "Your email is confirmed. You're all set."
              : "This verification link is invalid or has expired."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" render={<Link href="/dashboard" />}>
            Go to dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const user = await getCurrentUser();
  return (
    <Card>
      <CardHeader>
        <MailCheck className="size-8 text-primary" />
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          {user
            ? `We sent a verification link to ${user.email}. Click it to confirm your address.`
            : "We sent you a verification link. Click it to confirm your address."}
        </CardDescription>
      </CardHeader>
      {user && !user.emailVerified && (
        <CardFooter>
          <ResendVerification />
        </CardFooter>
      )}
    </Card>
  );
}
