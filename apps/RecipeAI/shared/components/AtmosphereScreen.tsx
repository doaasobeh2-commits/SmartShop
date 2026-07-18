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
};

export function AtmosphereScreen({
  atmosphere,
  imageUrl,
  children,
  contentLayout = "bottom",
  variant = "full",
  dark = false,
  className = "",
}: AtmosphereScreenProps) {
  const config = atmospheres[atmosphere];
  const isDark = dark || config.dark;
  const isStrip = variant === "strip";

  const backgroundStyle = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: config.fallbackGradient };

  const rootClass = isStrip
    ? "relative flex h-[32vh] max-h-[38vh] min-h-[22vh] w-full shrink-0 flex-col overflow-hidden"
    : "relative flex min-h-full w-full flex-col overflow-hidden";

  return (
    <div
      className={`${rootClass} ${className}`.trim()}
      style={{
        ...backgroundStyle,
        backgroundColor: isDark ? "#1A1918" : "#FAF9F7",
      }}
    >
      {!isDark && config.overlayGradient !== "none" && (
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
