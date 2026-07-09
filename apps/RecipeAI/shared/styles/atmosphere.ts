import type { ScreenAtmosphere } from "@recipe-ai/core/types";

export type AtmosphereConfig = {
  /** CSS background when no photography asset is loaded yet */
  fallbackGradient: string;
  /** Optional overlay gradient for text legibility */
  overlayGradient: string;
  /** Fade into warm white (light screens) or cook dark */
  contentFade: string;
  dark?: boolean;
};

/**
 * Placeholder gradients evoke each screen's emotional atmosphere until
 * premium lifestyle photography is wired via `imageUrl`.
 */
export const atmospheres: Record<ScreenAtmosphere, AtmosphereConfig> = {
  "kitchen-morning": {
    fallbackGradient:
      "linear-gradient(165deg, #E8DFD4 0%, #C9B8A8 35%, #A89585 70%, #8B7355 100%)",
    overlayGradient:
      "linear-gradient(to top, rgba(26, 25, 24, 0.75) 0%, rgba(26, 25, 24, 0.2) 45%, transparent 70%)",
    contentFade: "linear-gradient(to bottom, transparent 0%, #FAF9F7 85%)",
  },
  "vegetables-fresh": {
    fallbackGradient:
      "linear-gradient(160deg, #E8F0E4 0%, #C5D4BC 30%, #8FA87E 55%, #6B8F5E 80%, #4A6B42 100%)",
    overlayGradient:
      "linear-gradient(to top, rgba(26, 25, 24, 0.65) 0%, rgba(26, 25, 24, 0.15) 50%, transparent 75%)",
    contentFade: "linear-gradient(to bottom, transparent 0%, #FAF9F7 88%)",
  },
  "meal-evening": {
    fallbackGradient:
      "linear-gradient(180deg, #3D2E28 0%, #5C4033 25%, #8B6914 50%, #C4A574 75%, #E8DCC8 100%)",
    overlayGradient:
      "linear-gradient(to top, rgba(250, 249, 247, 0.95) 0%, rgba(250, 249, 247, 0.4) 35%, transparent 60%)",
    contentFade: "linear-gradient(to bottom, transparent 55%, #FAF9F7 92%)",
  },
  "meal-preview": {
    fallbackGradient:
      "linear-gradient(180deg, #4A3728 0%, #6B5344 30%, #A67C52 60%, #D4C4B0 100%)",
    overlayGradient:
      "linear-gradient(to bottom, transparent 0%, rgba(250, 249, 247, 0.92) 75%)",
    contentFade: "linear-gradient(to bottom, transparent 40%, #FAF9F7 85%)",
  },
  "cookbook-dark": {
    fallbackGradient: "linear-gradient(180deg, #1A1918 0%, #252422 100%)",
    overlayGradient: "none",
    contentFade: "none",
    dark: true,
  },
  "planning-light": {
    fallbackGradient:
      "linear-gradient(180deg, #F5F0E8 0%, #EDE6DC 40%, #E5DDD2 100%)",
    overlayGradient:
      "linear-gradient(to bottom, rgba(250, 249, 247, 0.3) 0%, #FAF9F7 70%)",
    contentFade: "linear-gradient(to bottom, transparent 0%, #FAF9F7 60%)",
  },
  "dinner-complete": {
    fallbackGradient:
      "linear-gradient(165deg, #2C2420 0%, #4A3F38 30%, #6B5A4E 55%, #A89585 80%, #D4C8BC 100%)",
    overlayGradient:
      "linear-gradient(to top, rgba(250, 249, 247, 0.97) 0%, rgba(250, 249, 247, 0.5) 40%, transparent 65%)",
    contentFade: "linear-gradient(to bottom, transparent 50%, #FAF9F7 90%)",
  },
};
