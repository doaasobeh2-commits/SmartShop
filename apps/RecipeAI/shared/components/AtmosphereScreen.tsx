import type { ReactNode } from "react";
import type { ScreenAtmosphere } from "@recipe-ai/core/types";
import { atmospheres } from "../styles/atmosphere";

type AtmosphereScreenProps = {
  atmosphere: ScreenAtmosphere;
  imageUrl?: string;
  children: ReactNode;
  /** Where content sits: bottom (Tonight) or scroll (Preview) */
  contentLayout?: "bottom" | "scroll";
  dark?: boolean;
  className?: string;
};

export function AtmosphereScreen({
  atmosphere,
  imageUrl,
  children,
  contentLayout = "bottom",
  dark = false,
  className = "",
}: AtmosphereScreenProps) {
  const config = atmospheres[atmosphere];
  const isDark = dark || config.dark;

  const backgroundStyle = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: config.fallbackGradient };

  return (
    <div
      className={`relative flex min-h-full w-full flex-col overflow-hidden ${className}`}
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

      {!isDark && config.contentFade !== "none" && contentLayout === "bottom" && (
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
