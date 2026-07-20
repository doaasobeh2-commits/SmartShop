import { imageObjectPosition } from "../data/imageFocalPoints";
import { STRIP_HERO_BRIDGE } from "./livingKitchenVisual";

type ScreenHeroBandProps = {
  imageUrl: string;
  /** compact = onboarding strips; default = review/detail bands */
  size?: "compact" | "default" | "strong";
  objectPosition?: string;
};

const SIZE_CLASS = {
  compact: "h-[22vh] max-h-[200px] min-h-[152px]",
  default: "h-[24vh] max-h-[220px] min-h-[160px]",
  strong: "h-[32vh] max-h-[280px] min-h-[200px]",
} as const;

export function ScreenHeroBand({
  imageUrl,
  size = "default",
  objectPosition,
}: ScreenHeroBandProps) {
  const position = objectPosition ?? imageObjectPosition(imageUrl);

  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden ${SIZE_CLASS[size]}`}
    >
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: position,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%]"
        style={{ background: STRIP_HERO_BRIDGE }}
        aria-hidden
      />
    </div>
  );
}
