import "server-only";
import type { Locale } from "./config";
import type { Messages } from "./translate";

/**
 * Per-locale message catalogs, dynamically imported so each locale's strings are
 * code-split and only loaded on the server for the requested locale.
 */
const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import("./dictionaries/en.json"),
  es: () => import("./dictionaries/es.json"),
  pt: () => import("./dictionaries/pt.json"),
};

export async function getDictionary(locale: Locale): Promise<Messages> {
  return (await loaders[locale]()).default;
}
