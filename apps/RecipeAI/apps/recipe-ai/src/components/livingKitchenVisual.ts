/** Restrained hero → cream bridge — keeps food visible, avoids foggy overlays. */
export const STRIP_HERO_BRIDGE =
  "linear-gradient(to bottom, transparent 0%, rgba(250, 249, 247, 0.15) 50%, rgba(250, 249, 247, 0.58) 82%, var(--warm-white) 100%)";

export const CONTENT_SURFACE = {
  background: "rgba(255, 253, 249, 0.96)",
  borderColor: "rgba(240, 237, 232, 0.95)",
  boxShadow: "0 8px 22px rgba(58, 36, 22, 0.04)",
} as const;

export const STICKY_FOOTER_GRADIENT =
  "linear-gradient(to top, var(--warm-white) 75%, rgba(250, 249, 247, 0))";

export const SAFE_BOTTOM = "max(1.5rem, env(safe-area-inset-bottom, 0px))";
