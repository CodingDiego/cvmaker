"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Shared building blocks for the auth screens. Keeps every form visually
 * consistent: icon-led inputs, a password reveal toggle, a card with a branded
 * header badge, and a submit button wired to the form's pending state.
 */

export function AuthCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl border bg-background shadow-sm">
          <Icon className="size-5 text-foreground" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-balance text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function IconField({
  id,
  label,
  icon: Icon,
  labelAction,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  icon: LucideIcon;
  labelAction?: React.ReactNode;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn("h-11 pl-9", className)}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  icon: Icon,
  labelAction,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  icon: LucideIcon;
  labelAction?: React.ReactNode;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn("h-11 px-9", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}
