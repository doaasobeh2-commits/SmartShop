import type { CSSProperties } from "react";
import { GRAD } from "../../styles/design";

export function GBtn({ children, onClick, className = "", outline = false, sm = false, style = {} }: {
  children: React.ReactNode; onClick?: () => void;
  className?: string; outline?: boolean; sm?: boolean; style?: CSSProperties;
}) {
  const base = `${sm ? "px-4 py-2.5 text-sm" : "px-6 py-4 text-base"} rounded-2xl font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2`;
  if (outline) return (
    <button type="button" onClick={onClick} className={`${base} border text-blue-400 ${className}`}
      style={{ borderColor: "rgba(0,102,255,0.4)", background: "rgba(0,102,255,0.08)", ...style }}>
      {children}
    </button>
  );
  return (
    <button type="button" onClick={onClick} className={`${base} text-white ${className}`}
      style={{ background: GRAD, boxShadow: "0 4px 24px rgba(0,102,255,0.35)", ...style }}>
      {children}
    </button>
  );
}
