import type { HTMLAttributes, ReactNode } from "react";

export type HeaderProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
};

export function Header({
  title,
  subtitle,
  onBack,
  backLabel = "Zurück",
  rightSlot,
  className = "",
  ...props
}: HeaderProps) {
  return (
    <header
      className={`shrink-0 border-b border-[var(--border)]/50 bg-background px-5 pb-4 pt-3 ${className}`}
      {...props}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-2 flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)]"
        >
          <span aria-hidden>‹</span>
          {backLabel}
        </button>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? (
            <h1
              className="truncate text-xl font-black text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/15 text-[var(--primary)]">
            {rightSlot}
          </div>
        ) : null}
      </div>
    </header>
  );
}
