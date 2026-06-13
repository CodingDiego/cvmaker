import { parseAsString, parseAsStringEnum } from "nuqs/server";
import { TEMPLATES } from "@/templates/registry";
import { FONT_OPTIONS } from "@/lib/font-config";

/**
 * Shared nuqs parsers — defined once and imported by both client hooks
 * (`useQueryStates`) and server `searchParams` parsing, so the URL contract
 * never drifts between the two. Import server helpers from `nuqs/server` so this
 * module is safe in both environments.
 */

const TEMPLATE_VALUES = ["all", ...TEMPLATES.map((t) => t.id)] as const;
const FONT_VALUES = ["all", ...FONT_OPTIONS.map((f) => f.id)] as const;

/** Dashboard "My CVs" search + template filter (client-side over fetched data). */
export const cvSearchParsers = {
  q: parseAsString.withDefault(""),
  template: parseAsStringEnum([...TEMPLATE_VALUES]).withDefault("all"),
};

/** Templates gallery: free-text search + font filter. */
export const templateSearchParsers = {
  q: parseAsString.withDefault(""),
  font: parseAsStringEnum([...FONT_VALUES]).withDefault("all"),
};
