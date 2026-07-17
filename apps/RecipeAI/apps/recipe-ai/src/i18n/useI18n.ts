import { useMemo } from "react";
import { useAppState } from "../hooks/useAppState";
import { normalizeAppLocale, type AppLocale, type MessageKey } from "./types";
import { t as translate } from "./t";

export function useI18n() {
  const { preferences } = useAppState();
  const locale: AppLocale = useMemo(
    () => normalizeAppLocale(preferences.language),
    [preferences.language],
  );

  return {
    locale,
    t: (key: MessageKey, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
  };
}

/** For screens outside useAppState (e.g. early auth shell). */
export function tForLanguage(
  language: string | undefined,
  key: MessageKey,
  vars?: Record<string, string | number>,
) {
  return translate(normalizeAppLocale(language), key, vars);
}
