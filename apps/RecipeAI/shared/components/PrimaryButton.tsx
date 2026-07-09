import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  size?: "md" | "lg";
};

export function PrimaryButton({
  children,
  fullWidth = true,
  size = "lg",
  className = "",
  ...props
}: PrimaryButtonProps) {
  const sizeClass = size === "lg" ? "py-4 text-base" : "py-3 text-sm";

  return (
    <button
      type="button"
      className={`rounded-2xl font-medium tracking-wide text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 ${sizeClass} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      style={{ backgroundColor: "var(--primary)" }}
      {...props}
    >
      {children}
    </button>
  );
}
