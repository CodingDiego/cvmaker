import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <RegisterForm />;
}
