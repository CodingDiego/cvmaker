"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import { registerAction, type ActionState } from "@/lib/auth/actions";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";

const initial: ActionState = { status: "idle" };

export function RegisterForm() {
  const router = useRouter();
  const [state, action] = useActionState(registerAction, initial);

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
      <form action={action} className="space-y-4">
        <IconField
          id="name"
          name="name"
          label="Name"
          icon={User}
          autoComplete="name"
          placeholder="Jane Doe"
        />
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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton>Create account</SubmitButton>
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
