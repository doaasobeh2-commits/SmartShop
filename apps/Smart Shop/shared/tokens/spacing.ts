export const spacing = {
  0: "0px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const dimensions = {
  phoneWidth: "340px",
  phoneHeight: "680px",
  dynamicIslandWidth: "110px",
  dynamicIslandHeight: "28px",
  dynamicIslandTop: "12px",
  homeIndicatorWidth: "96px",
  homeIndicatorHeight: "4px",
  appBarIcon: "36px",
  listItemIcon: "40px",
  welcomeHeroIcon: "80px",
  inputHeight: "36px",
  buttonHeightSm: "32px",
  buttonHeightDefault: "36px",
  buttonHeightLg: "40px",
} as const;

export type SpacingToken = keyof typeof spacing;
