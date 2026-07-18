import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  selected?: boolean;
};

export function Chip({ children, selected = false, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${className}`}
      style={{
        background: selected ? "var(--brand-primary)" : "rgba(250, 249, 247, 0.88)",
        color: selected ? "var(--warm-white)" : "var(--deep-charcoal)",
        border: selected ? "none" : "1px solid var(--soft-beige)",
        backdropFilter: "blur(12px)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
