import type { HTMLAttributes, ReactNode } from "react";

export type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconClassName?: string;
};

export function StatCard({
  label,
  value,
  icon,
  iconClassName = "text-[var(--chart-5)]",
  className = "",
  ...props
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 ${className}`}
      {...props}
    >
      {icon ? (
        <div className={`mb-2 flex h-3.5 w-3.5 items-center justify-center ${iconClassName}`}>
          {icon}
        </div>
      ) : null}
      <div className="truncate text-xl font-black text-[var(--foreground)]">{value}</div>
      <div className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
