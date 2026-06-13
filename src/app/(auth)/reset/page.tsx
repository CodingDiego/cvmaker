import { ResetRequestForm, ResetPerformForm } from "@/components/auth/reset-forms";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return token ? <ResetPerformForm token={token} /> : <ResetRequestForm />;
}
