import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
