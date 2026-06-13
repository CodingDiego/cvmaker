"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { loginAction, verifyLoginTwoFactorAction, type ActionState } from "@/lib/auth/actions";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";

const initial: ActionState = { status: "idle" };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [state, action] = useActionState(loginAction, initial);
  const [twoFaState, twoFaAction] = useActionState(verifyLoginTwoFactorAction, initial);

  useEffect(() => {
    if (state.status === "success" || twoFaState.status === "success") {
      router.push(next);
      router.refresh();
    }
  }, [state.status, twoFaState.status, next, router]);

  // Second factor step.
  if (state.status === "twofa") {
    return (
      <AuthCard
        icon={ShieldCheck}
        title="Two-factor authentication"
        description="Enter the 6-digit code from your authenticator app, or a backup code."
      >
        <form action={twoFaAction} className="space-y-4">
          <input type="hidden" name="challengeId" value={state.challengeId} />
          <IconField
            id="code"
            name="code"
            label="Authentication code"
            icon={KeyRound}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="123456"
            className="text-center font-mono text-lg tracking-[0.3em]"
          />
          {twoFaState.status === "error" && <FormError message={twoFaState.message} />}
          <SubmitButton>Verify</SubmitButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={LogIn} title="Welcome back" description="Sign in to your CVMaker account.">
      <form action={action} className="space-y-4">
        <IconField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="you@email.com"
        />
        <PasswordField
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          autoComplete="current-password"
          required
          placeholder="••••••••"
          labelAction={
            <Link href="/reset" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          }
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton>Sign in</SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
