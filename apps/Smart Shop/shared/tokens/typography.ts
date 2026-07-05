export const typography = {
  fontFamily: {
    sans: '"Plus Jakarta Sans", sans-serif',
    display: '"Outfit", sans-serif',
  },
  fontSize: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    micro9: "9px",
    micro10: "10px",
    micro11: "11px",
  },
  fontWeight: {
    normal: 400,
    medium: 600,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
  },
  letterSpacing: {
    brand: "0.12em",
    loginBrand: "0.15em",
    wide: "0.025em",
    wider: "0.05em",
  },
} as const;

export type TypographyToken = keyof typeof typography;
