"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Link } from "@/components/link";
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
import { useT } from "@/i18n/provider";
import { safeNext, withNext } from "@/lib/auth/safe-next";

const initial: ActionState = { status: "idle" };

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
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
        title={t("auth.login.twoFaTitle")}
        description={t("auth.login.twoFaDescription")}
      >
        <form
          onSubmit={twoFaForm.handleSubmit((values) => {
            const formData = new FormData();
            formData.set("challengeId", state.challengeId);
            formData.set("code", values.code);
            startTransition(() => twoFaAction(formData));
          })}
          className="space-y-4"
          noValidate
        >
          <input type="hidden" name="challengeId" value={state.challengeId} />
          <IconField
            id="code"
            label={t("auth.login.authCode")}
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
          <SubmitButton pending={twoFaPending}>{t("auth.login.verify")}</SubmitButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={LogIn} title={t("auth.login.title")} description={t("auth.login.description")}>
      <form
        onSubmit={loginForm.handleSubmit((values) => {
          const formData = new FormData();
          formData.set("email", values.email);
          formData.set("password", values.password);
          startTransition(() => action(formData));
        })}
        className="space-y-4"
        noValidate
      >
        <IconField
          id="email"
          type="email"
          label={t("auth.login.email")}
          icon={Mail}
          autoComplete="email"
          required
          placeholder={t("auth.login.emailPlaceholder")}
          error={loginForm.formState.errors.email?.message}
          {...loginForm.register("email")}
        />
        <PasswordField
          id="password"
          label={t("auth.login.password")}
          icon={Lock}
          autoComplete="current-password"
          required
          placeholder={t("auth.login.passwordPlaceholder")}
          error={loginForm.formState.errors.password?.message}
          labelAction={
            <Link href="/reset" className="text-xs text-muted-foreground hover:text-foreground">
              {t("auth.login.forgot")}
            </Link>
          }
          {...loginForm.register("password")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>{t("auth.login.submit")}</SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
          <Link
            href={withNext("/register", next)}
            className="font-medium text-foreground hover:underline"
          >
            {t("auth.login.createOne")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
