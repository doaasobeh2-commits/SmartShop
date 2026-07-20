import type { ReactNode } from "react";
import type { ScreenAtmosphere } from "@recipe-ai/core/types";
import { atmospheres } from "../styles/atmosphere";

type AtmosphereScreenProps = {
  atmosphere: ScreenAtmosphere;
  imageUrl?: string;
  children: ReactNode;
  /** Where content sits: bottom (Tonight) or scroll (Preview) */
  contentLayout?: "bottom" | "scroll";
  /**
   * full — fill the parent (default screen backdrop).
   * strip — short decorative band; does not consume full viewport height.
   */
  variant?: "full" | "strip";
  dark?: boolean;
  className?: string;
  /** CSS background-position for cover crops */
  objectPosition?: string;
};

/** Restrained strip bridge — food stays visible, cream transition stays soft. */
const STRIP_CREAM_BRIDGE =
  "linear-gradient(to bottom, transparent 0%, rgba(250, 249, 247, 0.15) 50%, rgba(250, 249, 247, 0.58) 82%, var(--warm-white, #faf9f7) 100%)";

export function AtmosphereScreen({
  atmosphere,
  imageUrl,
  children,
  contentLayout = "bottom",
  variant = "full",
  dark = false,
  className = "",
  objectPosition = "50% 50%",
}: AtmosphereScreenProps) {
  const config = atmospheres[atmosphere];
  const isDark = dark || config.dark;
  const isStrip = variant === "strip";

  const backgroundStyle = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: objectPosition,
      }
    : { background: config.fallbackGradient };

  const rootClass = isStrip
    ? "relative flex h-[26vh] max-h-[240px] min-h-[168px] w-full shrink-0 flex-col overflow-hidden"
    : "relative flex min-h-full w-full flex-col overflow-hidden";

  return (
    <div
      className={`${rootClass} ${className}`.trim()}
      style={{
        ...backgroundStyle,
        backgroundColor: isDark ? "#1A1918" : "#FAF9F7",
      }}
    >
      {/* Full-bleed screens may need legibility overlays; strip heroes stay crisp. */}
      {!isStrip && !isDark && config.overlayGradient !== "none" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: config.overlayGradient }}
        />
      )}

      {!isStrip &&
        !isDark &&
        config.contentFade !== "none" &&
        contentLayout === "bottom" && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
            style={{ background: config.contentFade }}
          />
        )}

      {isStrip && !isDark ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%]"
          style={{ background: STRIP_CREAM_BRIDGE }}
          aria-hidden
        />
      ) : null}

      <div
        className={
          contentLayout === "scroll"
            ? "relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto"
            : "relative z-10 flex min-h-0 flex-1 flex-col"
        }
      >
        {children}
      </div>
    </div>
  );
}
