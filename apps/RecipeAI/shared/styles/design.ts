import type { CSSProperties } from "react";

/** Bundled logo — never reference Desktop paths at runtime. */
export const SHAREYUM_LOGO_SRC = "/assets/shareyum-logo.jpeg";

export const colors = {
  brandPrimary: "#5A4030",
  brandChocolate: "#3A2416",
  accent: "#C4652E",
  warmWhite: "#FAF9F7",
  surface: "#F3EEE6",
  softBeige: "#F0EDE8",
  warmGray: "#8A827A",
  deepCharcoal: "#1A1918",
  decorativeGold: "#D5AB7B",
  success: "#5C7A5A",
  warning: "#B8863A",
  error: "#9E4A3D",
  cookBackground: "#1A1918",
  cookSurface: "#252422",
  cookText: "#F5F3F0",
  cookProgressTrack: "#3D3A37",
  cookMuted: "#9A9590",
  kitchenWood: "#8B7355",
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
