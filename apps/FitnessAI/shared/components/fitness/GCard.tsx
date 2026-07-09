import type { CSSProperties } from "react";
import { GLASS } from "../../styles/design";

export function GCard({ children, className = "", style = {}, onClick }: {
  children: React.ReactNode; className?: string;
  style?: CSSProperties; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={`rounded-3xl ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`} style={{ ...GLASS, ...style }}>
      {children}
    </div>
  );
}
