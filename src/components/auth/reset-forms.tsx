"use client";

import { startTransition, useActionState } from "react";
import { Link } from "@/components/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, Lock, Mail, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  requestPasswordResetAction,
  performPasswordResetAction,
  type ActionState,
} from "@/lib/auth/actions";
import {
  resetPerformSchema,
  resetRequestSchema,
  type ResetPerformValues,
  type ResetRequestValues,
} from "@/lib/auth/auth-schemas";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";
import { useT } from "@/i18n/provider";

const initial: ActionState = { status: "idle" };

export function ResetRequestForm() {
  const t = useT();
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  const form = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: "" },
  });

  if (state.status === "success") {
    return (
      <AuthCard
        icon={MailCheck}
        title={t("auth.reset.sentTitle")}
        description={t("auth.reset.sentDescription")}
      >
        <Button variant="outline" className="h-11 w-full" render={<Link href="/login" />}>
          {t("auth.reset.backToSignIn")}
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={KeyRound}
      title={t("auth.reset.requestTitle")}
      description={t("auth.reset.requestDescription")}
    >
      <form
        onSubmit={form.handleSubmit((values) => {
          const formData = new FormData();
          formData.set("email", values.email);
          startTransition(() => action(formData));
        })}
        className="space-y-4"
        noValidate
      >
        <IconField
          id="email"
          type="email"
          label={t("auth.reset.email")}
          icon={Mail}
          autoComplete="email"
          required
          placeholder={t("auth.reset.emailPlaceholder")}
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>{t("auth.reset.sendLink")}</SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.reset.rememberedIt")}{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            {t("auth.reset.backToSignIn")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export function ResetPerformForm({ token }: { token: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(performPasswordResetAction, initial);
  const form = useForm<ResetPerformValues>({
    resolver: zodResolver(resetPerformSchema),
    defaultValues: { password: "" },
  });

  if (state.status === "success") {
    return (
      <AuthCard
        icon={CheckCircle2}
        title={t("auth.reset.updatedTitle")}
        description={t("auth.reset.updatedDescription")}
      >
        <Button className="h-11 w-full" render={<Link href="/login" />}>
          {t("auth.reset.signIn")}
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={Lock}
      title={t("auth.reset.performTitle")}
      description={t("auth.reset.performDescription")}
    >
      <form
        onSubmit={form.handleSubmit((values) => {
          const formData = new FormData();
          formData.set("token", token);
          formData.set("password", values.password);
          startTransition(() => action(formData));
        })}
        className="space-y-4"
        noValidate
      >
        <input type="hidden" name="token" value={token} />
        <PasswordField
          id="password"
          label={t("auth.reset.newPassword")}
          icon={Lock}
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={t("auth.reset.passwordPlaceholder")}
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>{t("auth.reset.updatePassword")}</SubmitButton>
      </form>
    </AuthCard>
  );
}
