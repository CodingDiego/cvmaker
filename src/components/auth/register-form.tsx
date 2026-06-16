"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Link } from "@/components/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { registerAction, type ActionState } from "@/lib/auth/actions";
import { registerSchema, type RegisterValues } from "@/lib/auth/auth-schemas";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";
import { useT } from "@/i18n/provider";
import { safeNext, withNext } from "@/lib/auth/safe-next";

const initial: ActionState = { status: "idle" };

export function RegisterForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [state, action, pending] = useActionState(registerAction, initial);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (state.status === "success") {
      router.push(next);
      router.refresh();
    }
  }, [state.status, next, router]);

  return (
    <AuthCard
      icon={UserPlus}
      title={t("auth.register.title")}
      description={t("auth.register.description")}
    >
      <form
        onSubmit={form.handleSubmit((values) => {
          const formData = new FormData();
          formData.set("name", values.name);
          formData.set("email", values.email);
          formData.set("password", values.password);
          startTransition(() => action(formData));
        })}
        className="space-y-4"
        noValidate
      >
        <IconField
          id="name"
          label={t("auth.register.name")}
          icon={User}
          autoComplete="name"
          placeholder={t("auth.register.namePlaceholder")}
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <IconField
          id="email"
          type="email"
          label={t("auth.register.email")}
          icon={Mail}
          autoComplete="email"
          required
          placeholder={t("auth.register.emailPlaceholder")}
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <PasswordField
          id="password"
          label={t("auth.register.password")}
          icon={Lock}
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={t("auth.register.passwordPlaceholder")}
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>{t("auth.register.submit")}</SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.register.haveAccount")}{" "}
          <Link
            href={withNext("/login", next)}
            className="font-medium text-foreground hover:underline"
          >
            {t("auth.register.signIn")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
