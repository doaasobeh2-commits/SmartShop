import { Link } from "react-router-dom";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-slate-line bg-white px-4 py-10 text-center text-[14px] text-slate-label">
      {label}
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
    <div className="rounded-xl border border-dashed border-slate-line bg-white px-4 py-10 text-center">
      <div className="text-[15px] font-medium text-navy-ink">{title}</div>
      {detail ? (
        <p className="mt-2 text-[13px] text-slate-label">{detail}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center">
      <div className="text-[15px] font-medium text-rose-900">{title}</div>
      {detail ? (
        <p className="mt-2 text-[13px] text-rose-800">{detail}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-navy px-3 py-1.5 text-[13px] font-medium text-white"
        >
          Retry
        </button>
      ) : null}
      <div className="mt-3 text-[12px] text-rose-700">
        <Link to="/login" className="underline">
          Sign in again
        </Link>
      </div>
    </div>
  );
}
