import type { ReactNode } from "react";
import type { AppLocale } from "../i18n/types";
import { t } from "../i18n/t";
import { useI18n } from "../i18n/useI18n";

export function LoadingState({ label }: { label?: string }) {
  const { t: translate } = useI18n();
  return (
    <div className="rounded-2xl bg-white/90 px-4 py-8 text-center text-sm text-slate-600">
      {label ?? translate("loading")}
    </div>
  );
}

export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/40 bg-white/80 px-4 py-8 text-center">
      <div className="text-base font-medium text-slate-900">{title}</div>
      {detail ? <p className="mt-2 text-sm text-slate-600">{detail}</p> : null}
    </div>
  );
}

export function ErrorState({
  title,
  detail,
  onRetry,
  retryLabel,
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
}) {
  const { t: translate } = useI18n();
  return (
    <div className="rounded-2xl bg-rose-50 px-4 py-6 text-center text-rose-900">
      <div className="text-base font-medium">{title}</div>
      {detail ? <p className="mt-2 text-sm text-rose-800">{detail}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          {retryLabel ?? translate("retry")}
        </button>
      ) : null}
    </div>
  );
}

export function mapApiErrorMessage(
  status: number,
  fallback: string,
  locale: AppLocale = "en",
): string {
  if (status === 401) return t(locale, "signInRequired");
  if (status === 403) return t(locale, "forbidden");
  if (status >= 500) return t(locale, "serverError");
  return fallback;
}
