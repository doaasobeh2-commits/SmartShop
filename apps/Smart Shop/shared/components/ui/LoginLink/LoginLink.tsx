import type { ButtonHTMLAttributes } from "react";

export type LoginLinkProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function LoginLink({ className = "", ...props }: LoginLinkProps) {
  return (
    <button
      type="button"
      className={`w-full py-3 text-sm font-bold text-muted-foreground ${className}`}
      {...props}
    >
      Bereits registriert? <span className="text-primary">Anmelden</span>
    </button>
  );
}
