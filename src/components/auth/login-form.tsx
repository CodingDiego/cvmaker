"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginAction, verifyLoginTwoFactorAction, type ActionState } from "@/lib/auth/actions";
import {
  loginSchema,
  twoFaSchema,
  type LoginValues,
  type TwoFaValues,
} from "@/lib/auth/auth-schemas";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";

const initial: ActionState = { status: "idle" };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const loginFormRef = useRef<HTMLFormElement>(null);
  const twoFaFormRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState(loginAction, initial);
  const [twoFaState, twoFaAction, twoFaPending] = useActionState(
    verifyLoginTwoFactorAction,
    initial,
  );
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const twoFaForm = useForm<TwoFaValues>({
    resolver: zodResolver(twoFaSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (state.status === "success" || twoFaState.status === "success") {
      router.push(next);
      router.refresh();
    }
  }, [state.status, twoFaState.status, next, router]);

  if (state.status === "twofa") {
    return (
      <AuthCard
        icon={ShieldCheck}
        title="Two-factor authentication"
        description="Enter the 6-digit code from your authenticator app, or a backup code."
      >
        <form
          ref={twoFaFormRef}
          onSubmit={twoFaForm.handleSubmit(() => {
            const current = twoFaFormRef.current;
            if (!current) return;
            startTransition(() => twoFaAction(new FormData(current)));
          })}
          className="space-y-4"
          noValidate
        >
          <input type="hidden" name="challengeId" value={state.challengeId} />
          <IconField
            id="code"
            label="Authentication code"
            icon={KeyRound}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="123456"
            className="text-center font-mono text-lg tracking-[0.3em]"
            error={twoFaForm.formState.errors.code?.message}
            {...twoFaForm.register("code")}
          />
          {twoFaState.status === "error" && <FormError message={twoFaState.message} />}
          <SubmitButton pending={twoFaPending}>Verify</SubmitButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={LogIn} title="Welcome back" description="Sign in to your CVMaker account.">
      <form
        ref={loginFormRef}
        onSubmit={loginForm.handleSubmit(() => {
          const current = loginFormRef.current;
          if (!current) return;
          startTransition(() => action(new FormData(current)));
        })}
        className="space-y-4"
        noValidate
      >
        <IconField
          id="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="you@email.com"
          error={loginForm.formState.errors.email?.message}
          {...loginForm.register("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          icon={Lock}
          autoComplete="current-password"
          required
          placeholder="Password"
          error={loginForm.formState.errors.password?.message}
          labelAction={
            <Link href="/reset" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          }
          {...loginForm.register("password")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>Sign in</SubmitButton>
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
