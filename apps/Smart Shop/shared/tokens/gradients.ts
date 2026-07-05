import { colors } from "./colors";

export const gradients = {
  appBackground: `radial-gradient(ellipse 80% 60% at 50% 0%, ${colors.primaryGlow12} 0%, transparent 70%), ${colors.background}`,
  brand: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.purple} 100%)`,
} as const;

export type GradientToken = keyof typeof gradients;
