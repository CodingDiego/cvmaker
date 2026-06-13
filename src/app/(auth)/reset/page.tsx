import type { Metadata } from "next";
import { ResetRequestForm, ResetPerformForm } from "@/components/auth/reset-forms";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return token ? <ResetPerformForm token={token} /> : <ResetRequestForm />;
}
