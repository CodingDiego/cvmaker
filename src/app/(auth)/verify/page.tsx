import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/lib/auth/email";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { ResendVerification } from "@/components/auth/resend-verification";

export const metadata: Metadata = { title: "Verify email" };

function Shell({
  icon,
  iconClassName,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span
          className={`flex size-12 items-center justify-center rounded-xl border bg-background shadow-sm ${iconClassName ?? "text-foreground"}`}
        >
          {icon}
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-balance text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    const ok = await verifyEmailToken(token);
    return (
      <Shell
        icon={ok ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
        iconClassName={ok ? "text-foreground" : "text-destructive"}
        title={ok ? "Email verified" : "Verification failed"}
        description={
          ok
            ? "Your email is confirmed. You're all set."
            : "This verification link is invalid or has expired."
        }
      >
        <Button className="h-11 w-full" render={<Link href="/dashboard" />}>
          Go to dashboard
        </Button>
      </Shell>
    );
  }

  const user = await getCurrentUser();
  return (
    <Shell
      icon={<MailCheck className="size-5" />}
      title="Verify your email"
      description={
        user
          ? `We sent a verification link to ${user.email}. Click it to confirm your address.`
          : "We sent you a verification link. Click it to confirm your address."
      }
    >
      {user && !user.emailVerified && <ResendVerification />}
    </Shell>
  );
}
