import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free CVMaker account to build and export resumes.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <RegisterForm />;
}
