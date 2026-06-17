import type { Metadata } from "next";
import { Link } from "@/components/link";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/lib/auth/email";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { EmailVerificationPoller } from "@/components/auth/email-verification-poller";
import { ResendVerification } from "@/components/auth/resend-verification";
import { getTFromParams } from "@/i18n/server";
import { safeNext, withNext } from "@/lib/auth/safe-next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your CVMaker account email address.",
  robots: { index: false, follow: false },
};

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
    <section
      aria-labelledby="auth-state-title"
      className="rounded-2xl border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-8"
    >
      <header className="mb-6 flex flex-col items-center gap-3 text-center">
        <span
          className={`flex size-12 items-center justify-center rounded-xl border bg-background shadow-sm ${iconClassName ?? "text-foreground"}`}
        >
          {icon}
        </span>
        <div className="space-y-1.5">
          <h1 id="auth-state-title" className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-balance text-muted-foreground">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const [{ token, next: rawNext }, t] = await Promise.all([searchParams, getTFromParams(params)]);
  // Carry any "use this template" intent through email verification so the user
  // lands on the CV they were creating, not a generic dashboard.
  const next = safeNext(rawNext);
  const continueHref = withNext("/dashboard", next);

  if (token) {
    const ok = await verifyEmailToken(token);
    return (
      <Shell
        icon={ok ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
        iconClassName={ok ? "text-foreground" : "text-destructive"}
        title={ok ? t("auth.verify.verifiedTitle") : t("auth.verify.failedTitle")}
        description={ok ? t("auth.verify.verifiedDescription") : t("auth.verify.failedDescription")}
      >
        <Button className="h-11 w-full" render={<Link href={ok ? continueHref : "/dashboard"} />}>
          {t("auth.verify.goDashboard")}
        </Button>
      </Shell>
    );
  }

  const user = await getCurrentUser();

  if (user?.emailVerified) {
    return (
      <Shell
        icon={<CheckCircle2 className="size-5" />}
        title={t("auth.verify.verifiedTitle")}
        description={t("auth.verify.verifiedDescription")}
      >
        <Button className="h-11 w-full" render={<Link href={continueHref} />}>
          {t("auth.verify.goDashboard")}
        </Button>
      </Shell>
    );
  }

  return (
    <Shell
      icon={<MailCheck className="size-5" />}
      title={t("auth.verify.title")}
      description={
        user
          ? t("auth.verify.descriptionUser", { email: user.email })
          : t("auth.verify.descriptionGeneric")
      }
    >
      <EmailVerificationPoller enabled={Boolean(user && !user.emailVerified)} />
      {user && !user.emailVerified && <ResendVerification />}
    </Shell>
  );
}
