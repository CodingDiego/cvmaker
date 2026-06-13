"use client";

import { startTransition, useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { updateProfileAction, type AccountActionState } from "@/lib/auth/account-actions";
import { profileSchema, type ProfileValues } from "@/lib/auth/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AccountActionState = { status: "idle" };

export function ProfileForm({ email, name }: { email: string; name: string | null }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: name ?? "" },
  });
  const nameError = form.formState.errors.name?.message;

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        const formData = new FormData();
        formData.set("name", values.name);
        startTransition(() => action(formData));
      })}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          aria-invalid={Boolean(nameError) || undefined}
          aria-describedby={nameError ? "name-error" : undefined}
          {...form.register("name")}
        />
        {nameError && (
          <p id="name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        )}
      </div>
      {state.status === "error" && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Check className="size-4 text-primary" /> Profile saved
        </p>
      )}
      <Button type="submit" disabled={pending}>
        <Save className="size-4" /> {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
