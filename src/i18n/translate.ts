/**
 * Tiny translation helper shared by the server (`getT`) and client (`useT`).
 * Messages are nested objects; keys are dot-paths. Supports `{var}` interpolation
 * and falls back to the key itself when a string is missing (so a missing
 * translation is visible but never crashes).
 */
export type Messages = Record<string, unknown>;

export type Translator = (path: string, vars?: Record<string, string | number>) => string;

function lookup(messages: Messages, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, messages);
}

export function makeTranslator(messages: Messages): Translator {
  return (path, vars) => {
    const value = lookup(messages, path);
    if (typeof value !== "string") return path;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : `{${key}}`));
  };
}
