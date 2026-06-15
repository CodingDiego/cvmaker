import type { Metadata } from "next";
import { ResetRequestForm, ResetPerformForm } from "@/components/auth/reset-forms";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request or complete a CVMaker password reset.",
  robots: { index: false, follow: false },
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return token ? <ResetPerformForm token={token} /> : <ResetRequestForm />;
}
