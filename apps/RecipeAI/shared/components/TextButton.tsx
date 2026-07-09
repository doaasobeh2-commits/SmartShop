import type { ButtonHTMLAttributes, ReactNode } from "react";

type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function TextButton({ children, className = "", ...props }: TextButtonProps) {
  return (
    <button
      type="button"
      className={`text-sm font-medium transition-opacity hover:opacity-70 active:opacity-50 ${className}`}
      style={{ color: "var(--warm-gray)" }}
      {...props}
    >
      {children}
    </button>
  );
}
