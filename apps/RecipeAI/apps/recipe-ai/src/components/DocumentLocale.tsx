import { useEffect } from "react";
import { useI18n } from "../i18n/useI18n";

/** Syncs document lang/dir with the active ShareYum locale. */
export function DocumentLocale() {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
