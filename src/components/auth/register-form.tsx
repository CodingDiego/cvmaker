"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Link } from "@/components/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { registerAction, type ActionState } from "@/lib/auth/actions";
import { registerSchema, type RegisterValues } from "@/lib/auth/auth-schemas";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";

const initial: ActionState = { status: "idle" };

export function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerAction, initial);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <AuthCard
      icon={UserPlus}
      title="Create your account"
      description="Build ATS-friendly resumes for free."
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
          label="Name"
          icon={User}
          autoComplete="name"
          placeholder="Jane Doe"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <IconField
          id="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="you@email.com"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          icon={Lock}
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>Create account</SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
