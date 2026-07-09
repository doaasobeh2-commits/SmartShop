import type { CSSProperties } from "react";

export const GRAD = "linear-gradient(135deg, #0066FF 0%, #06B6D4 100%)";
export const GRAD_SOFT = "linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(6,182,212,0.15) 100%)";
export const GLASS: CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
};
