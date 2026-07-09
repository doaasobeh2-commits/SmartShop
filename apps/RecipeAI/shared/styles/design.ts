import type { CSSProperties } from "react";

export const colors = {
  warmWhite: "#FAF9F7",
  softBeige: "#F0EDE8",
  warmGray: "#9A9590",
  deepCharcoal: "#1A1918",
  cookBackground: "#1A1918",
  cookSurface: "#252422",
  cookText: "#F5F3F0",
  orange: "#D97742",
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const;

export const glassLight: CSSProperties = {
  background: "rgba(250, 249, 247, 0.82)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

export const glassDark: CSSProperties = {
  background: "rgba(26, 25, 24, 0.72)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};
