import type { CSSProperties, ReactNode } from "react";
import {
  dishImageContainerStyle,
  responsiveDishImageStyle,
  type DishFocalPoint,
  type DishImageCropPreset,
  DISH_CROP_ASPECT_RATIO,
} from "./responsiveDishImage";

export type ResponsiveDishImageProps = DishFocalPoint & {
  imageUrl: string;
  alt: string;
  preset?: DishImageCropPreset;
  aspectRatio?: string;
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
};

/**
 * Shared responsive dish image surface — consistent cover + focal point
 * across Tonight, Weekly Plan, recipe detail, pantry cards, and admin previews.
 */
export function ResponsiveDishImage({
  imageUrl,
  alt,
  preset = "hero",
  aspectRatio,
  className = "",
  innerClassName = "absolute inset-0",
  focalPointX,
  focalPointY,
  children,
}: ResponsiveDishImageProps) {
  const ratio = aspectRatio ?? DISH_CROP_ASPECT_RATIO[preset];
  const containerStyle: CSSProperties = dishImageContainerStyle(ratio);

  return (
    <div className={className} style={containerStyle}>
      <div
        className={innerClassName}
        style={responsiveDishImageStyle({
          imageUrl,
          focalPointX,
          focalPointY,
        })}
        role="img"
        aria-label={alt}
      />
      {children}
    </div>
  );
}
