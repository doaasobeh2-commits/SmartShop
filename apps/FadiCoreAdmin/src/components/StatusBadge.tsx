type StatusBadgeVariant =
  | "CONNECTED"
  | "BETA"
  | "HEALTHY"
  | "DEGRADED"
  | "OK"
  | "SLOW"
  | "WARNING"
  | "INFO"
  | "WARN"
  | "ERROR"
  | "COMPLETE"
  | "PROCESSING"
  | "PENDING"
  | "CRITICAL"
  | "NORMAL"
  | "DELETE"
  | "EXPORT"
  | "LIVE"
  | "PLANNED";

type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  withDot?: boolean;
  label?: string;
};

const styles: Record<StatusBadgeVariant, string> = {
  CONNECTED: "bg-success-soft text-success-text",
  BETA: "bg-accent-purpleSoft text-accent-purple",
  HEALTHY: "bg-success-soft text-success-text",
  DEGRADED: "bg-[#FFF1E0] text-[#C77700]",
  OK: "bg-success-soft text-success-text",
  SLOW: "bg-[#FFF1E0] text-[#C77700]",
  WARNING: "bg-[#FFF1E0] text-[#C77700]",
  INFO: "bg-[#E8EEF8] text-navy",
  WARN: "bg-[#FFF1E0] text-[#C77700]",
  ERROR: "bg-[#FDE8E8] text-[#C0392B]",
  COMPLETE: "bg-success-soft text-success-text",
  PROCESSING: "bg-[#FFF1E0] text-[#C77700]",
  PENDING: "bg-[#EEF1F6] text-slate-body",
  CRITICAL: "bg-[#FDE8E8] text-[#C0392B]",
  NORMAL: "bg-[#E8EEF8] text-navy",
  DELETE: "bg-[#FDE8E8] text-[#C0392B]",
  EXPORT: "bg-[#E8EEF8] text-navy",
  LIVE: "bg-success-soft text-success-text",
  PLANNED: "bg-[#EEF1F6] text-slate-body",
};

const dotStyles: Record<StatusBadgeVariant, string> = {
  CONNECTED: "bg-success",
  BETA: "bg-accent-purple",
  HEALTHY: "bg-success",
  DEGRADED: "bg-[#E89A2E]",
  OK: "bg-success",
  SLOW: "bg-[#E89A2E]",
  WARNING: "bg-[#E89A2E]",
  INFO: "bg-[#4C7BD9]",
  WARN: "bg-[#E89A2E]",
  ERROR: "bg-[#C0392B]",
  COMPLETE: "bg-success",
  PROCESSING: "bg-[#E89A2E]",
  PENDING: "bg-slate-icon",
  CRITICAL: "bg-[#C0392B]",
  NORMAL: "bg-[#4C7BD9]",
  DELETE: "bg-[#C0392B]",
  EXPORT: "bg-[#4C7BD9]",
  LIVE: "bg-success",
  PLANNED: "bg-slate-icon",
};

export function StatusBadge({
  variant,
  withDot = false,
  label,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] ${styles[variant]}`}
    >
      {withDot ? (
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />
      ) : null}
      {label ?? variant}
    </span>
  );
}
