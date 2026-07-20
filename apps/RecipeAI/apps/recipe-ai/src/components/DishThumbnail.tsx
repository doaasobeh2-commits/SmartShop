import { responsiveDishImageStyle } from "./responsiveDishImage";
import { ResponsiveDishImage } from "./DishImageSurface";

type DishThumbnailProps = {
  imageUrl: string;
  title: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-9 w-9 rounded-lg",
  md: "h-14 w-14 rounded-xl",
  lg: "h-[4.5rem] w-[4.5rem] rounded-2xl",
  hero: "w-full rounded-none",
} as const;

export function DishThumbnail({
  imageUrl,
  title,
  size = "md",
  className = "",
}: DishThumbnailProps) {
  if (size === "hero") {
    return (
      <ResponsiveDishImage
        imageUrl={imageUrl}
        alt={title}
        preset="hero"
        className={`shrink-0 ${SIZE_CLASS.hero} ${className}`.trim()}
      />
    );
  }

  return (
    <div
      className={`shrink-0 overflow-hidden ${SIZE_CLASS[size]} ${className}`.trim()}
      style={responsiveDishImageStyle({ imageUrl })}
      role="img"
      aria-label={title}
    />
  );
}
