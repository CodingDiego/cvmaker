export type PolarCheckoutLinkUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export function buildPolarCheckoutLink(
  checkoutLink: string,
  user: PolarCheckoutLinkUser,
): string {
  const url = new URL(checkoutLink);

  url.searchParams.set("customer_external_id", user.id);
  url.searchParams.set("reference_id", user.id);
  url.searchParams.set("utm_source", "free-cv");
  url.searchParams.set("utm_medium", "app");

  if (user.email) url.searchParams.set("customer_email", user.email);
  if (user.name) url.searchParams.set("customer_name", user.name);

  return url.toString();
}
