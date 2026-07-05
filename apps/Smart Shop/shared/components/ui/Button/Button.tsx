import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  labelAr?: string;
  variant?: ButtonVariant;
  showArrow?: boolean;
};

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function Button({
  children,
  labelAr,
  variant = "primary",
  showArrow = variant === "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        isPrimary
          ? "bg-primary text-white shadow-lg shadow-primary-30"
          : "border border-border bg-secondary-50 text-foreground"
      } ${className}`}
      {...props}
    >
      {children}
      {labelAr ? (
        <span className="text-xs opacity-60" dir="rtl">
          / {labelAr}
        </span>
      ) : null}
      {showArrow ? <ArrowRightIcon /> : null}
    </button>
  );
}
