import { colors } from "./colors";

export const shadows = {
  phoneFrame: `0 0 0 1px ${colors.shadowInner}, 0 30px 80px ${colors.shadowDrop}, 0 0 60px ${colors.primaryGlow15}`,
  brandIcon: `0 4px 16px ${colors.primaryGlow40}`,
  welcomeHero: `0 8px 32px ${colors.primaryGlow45}`,
  buttonPrimary: `0 10px 15px -3px ${colors.primaryGlow30}`,
  navBar: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  inputFocus: `0 0 0 3px ${colors.primaryGlow50}`,
} as const;

export type ShadowToken = keyof typeof shadows;
