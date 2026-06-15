"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { makeTranslator, type Messages, type Translator } from "./translate";

interface I18nValue {
  locale: Locale;
  t: Translator;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Seeds client components with the active locale + its messages. */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(() => ({ locale, t: makeTranslator(messages) }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useT(): Translator {
  return useI18n().t;
}

/** Non-throwing locale read for low-level components (e.g. Link) that may render
 * before the provider is established. Returns null when no provider is present. */
export function useOptionalLocale(): Locale | null {
  return useContext(I18nContext)?.locale ?? null;
}
