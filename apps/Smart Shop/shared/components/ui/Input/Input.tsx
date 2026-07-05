import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  leftIcon?: ReactNode;
};

export function Input({
  label,
  leftIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
        >
          {label}
        </label>
      ) : null}
      <div
        className={`flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 focus-within:border-[var(--ring)] focus-within:ring-[3px] focus-within:ring-[var(--ring)]/50 ${className}`}
      >
        {leftIcon ? (
          <span className="flex shrink-0 items-center text-[var(--muted-foreground)]">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
          {...props}
        />
      </div>
    </div>
  );
}
