import type { ReactNode } from "react";
import { Button } from "../../ui/Button";

export type DecisionCardProps = {
  title: string;
  lines: string[];
  primaryValue?: string;
  actionLabel?: string;
  onAction?: () => void;
  footer?: ReactNode;
};

export function DecisionCard({
  title,
  lines,
  primaryValue,
  actionLabel,
  onAction,
  footer,
}: DecisionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate text-xs font-bold text-foreground">{title}</h3>
        {primaryValue ? (
          <span
            className="max-w-[45%] shrink-0 truncate text-sm font-black text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {primaryValue}
          </span>
        ) : null}
      </div>
      <div className="space-y-0.5">
        {lines.map((line, index) => (
          <p key={`${title}-${index}`} className="truncate text-xs text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
      {footer}
      {actionLabel && onAction ? (
        <div className="mt-3">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
