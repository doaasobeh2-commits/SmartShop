import { SHAREYUM_LOGO_SRC } from "@recipe-ai/shared/styles/design";

type ShareYumLogoProps = {
  /** Display width in px; height follows aspect ratio (logo is square). */
  size?: number;
  className?: string;
  /**
   * Reserved for a future layered steam animation (SVG/PNG overlay).
   * The flat JPEG must not be distorted for animation in Phase A1.
   */
  animationSlot?: "none" | "steam-ready";
};

/**
 * Official ShareYum mark. Structure supports a future steam-only overlay
 * without altering the raster logo asset.
 */
export function ShareYumLogo({
  size = 160,
  className = "",
  animationSlot = "steam-ready",
}: ShareYumLogoProps) {
  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
      data-shareyum-logo-root
      data-animation-slot={animationSlot}
    >
      <img
        src={SHAREYUM_LOGO_SRC}
        alt="ShareYum"
        width={size}
        height={size}
        className="rounded-[22%] shadow-lg"
        style={{ width: size, height: size, objectFit: "contain" }}
        draggable={false}
      />
      {animationSlot === "steam-ready" && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22%]"
          data-shareyum-steam-layer
          aria-hidden
        />
      )}
    </div>
  );
}
