export const radius = {
  base: "14px",
  sm: "10px",
  md: "12px",
  lg: "14px",
  xl: "18px",
  phone: "44px",
  dynamicIsland: "14px",
  card: "12px",
  button: "16px",
  hero: "24px",
  input: "12px",
  full: "9999px",
} as const;

export type RadiusToken = keyof typeof radius;
