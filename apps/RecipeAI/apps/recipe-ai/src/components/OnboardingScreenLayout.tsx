import type { ReactNode } from "react";
import type { ScreenAtmosphere } from "@recipe-ai/core/types";
import { AtmosphereScreen } from "@recipe-ai/shared";
import { imageObjectPosition } from "../data/imageFocalPoints";
import { LivingKitchenPanel } from "./LivingKitchenPanel";
import { STRIP_HERO_BRIDGE } from "./livingKitchenVisual";

type HeroPresence = "compact" | "default" | "strong";

type OnboardingScreenLayoutProps = {
  children: ReactNode;
  heroImage?: string;
  atmosphere?: ScreenAtmosphere;
  compactHero?: boolean;
  /** Visual weight of the strip hero — does not stretch/distort the image */
  heroPresence?: HeroPresence;
  /** Soften hero → cream with a restrained photographic fade */
  softHeroBridge?: boolean;
  /** Extra top padding inside the cream panel (pushes content lower) */
  contentOffset?: "none" | "moderate" | "deep";
  /** Override automatic focal-point lookup */
  objectPosition?: string;
};

const HERO_CLASS: Record<HeroPresence, string> = {
  compact: "!h-[22vh] !max-h-[200px] !min-h-[152px]",
  default: "!h-[28vh] !max-h-[248px] !min-h-[176px]",
  strong: "!h-[34vh] !max-h-[300px] !min-h-[212px]",
};

const CONTENT_PT: Record<"none" | "moderate" | "deep", string> = {
  none: "pt-1",
  moderate: "pt-3",
  deep: "pt-5",
};

/**
 * Strip hero + cream content panel with a soft photographic bridge.
 * Mobile-safe composition at ~390×844.
 */
export function OnboardingScreenLayout({
  children,
  heroImage,
  atmosphere = "kitchen-morning",
  compactHero = false,
  heroPresence,
  softHeroBridge = true,
  contentOffset = "none",
  objectPosition,
}: OnboardingScreenLayoutProps) {
  const position = objectPosition ?? imageObjectPosition(heroImage);
  const presence: HeroPresence =
    heroPresence ?? (compactHero ? "compact" : "default");

  return (
    <LivingKitchenPanel className="flex min-h-0 flex-1 flex-col">
      <div className="relative shrink-0">
        <AtmosphereScreen
          atmosphere={atmosphere}
          variant="strip"
          imageUrl={heroImage}
          objectPosition={position}
          className={HERO_CLASS[presence]}
        >
          <div aria-hidden className="h-full" />
        </AtmosphereScreen>
        {softHeroBridge ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
            style={{ background: STRIP_HERO_BRIDGE }}
          />
        ) : null}
      </div>

      <div
        className={`relative z-10 -mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-8 ${CONTENT_PT[contentOffset]}`}
      >
        {children}
      </div>
    </LivingKitchenPanel>
  );
}
