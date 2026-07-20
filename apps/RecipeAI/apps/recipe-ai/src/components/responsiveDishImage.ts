import type { CSSProperties } from "react";
import { imageObjectPosition } from "../data/imageFocalPoints";
import { NEEDS_PHOTO_PLACEHOLDER_PATH } from "../data/catalog/imageAssets";

/** Shared crop presets for admin preview + consumer surfaces. */
export type DishImageCropPreset =
  | "thumb-sm"
  | "thumb-md"
  | "thumb-lg"
  | "hero"
  | "mobile-sm"
  | "mobile-lg"
  | "tablet"
  | "desktop";

export const DISH_CROP_ASPECT_RATIO: Record<DishImageCropPreset, string> = {
  "thumb-sm": "1 / 1",
  "thumb-md": "1 / 1",
  "thumb-lg": "1 / 1",
  hero: "16 / 10",
  "mobile-sm": "4 / 3",
  "mobile-lg": "16 / 10",
  tablet: "16 / 9",
  desktop: "16 / 9",
};

export type DishFocalPoint = {
  focalPointX?: number;
  focalPointY?: number;
};

export function isDishPlaceholderUrl(imageUrl: string | undefined): boolean {
  if (!imageUrl) return false;
  return imageUrl.includes(NEEDS_PHOTO_PLACEHOLDER_PATH);
}

export function resolveDishObjectPosition(
  imageUrl: string | undefined,
  focal?: DishFocalPoint,
): string {
  if (
    focal?.focalPointX != null &&
    focal?.focalPointY != null &&
    Number.isFinite(focal.focalPointX) &&
    Number.isFinite(focal.focalPointY)
  ) {
    return `${clampPercent(focal.focalPointX)}% ${clampPercent(focal.focalPointY)}%`;
  }
  return imageObjectPosition(imageUrl);
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export type ResponsiveDishImageStyleOptions = DishFocalPoint & {
  imageUrl: string;
};

/** Cover-style dish image — object-fit: cover equivalent via background-size. */
export function responsiveDishImageStyle(
  options: ResponsiveDishImageStyleOptions,
): CSSProperties {
  const { imageUrl, focalPointX, focalPointY } = options;
  if (isDishPlaceholderUrl(imageUrl)) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: "rgba(90, 64, 48, 0.05)",
    };
  }
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: resolveDishObjectPosition(imageUrl, {
      focalPointX,
      focalPointY,
    }),
    backgroundRepeat: "no-repeat",
  };
}

export function dishImageContainerStyle(aspectRatio: string): CSSProperties {
  return {
    aspectRatio,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  };
}

export const DEFAULT_IMAGE_QUALITY_GUIDANCE = `Natural homemade food photography — clear, accurate dish identity over artistic styling. Soft natural daylight, balanced exposure, gentle realistic colors with reduced saturation and no strong color grading. Avoid deep orange/red casts, overly dark shadows, excessive contrast, glossy artificial textures, glitter/sparkle, dramatic cinematic filters, and AI advertising looks. Plating authentic to the dish and cuisine; calm neutral backgrounds and plates so the food stays the focus. Avoid excessive symmetry and repetitive AI arrangements. Show only ingredients that belong in the approved recipe; do not invent toppings or sides. Believable matte food textures; no distorted utensils or food.`;

export const MUSAKHAN_IMAGE_GUIDANCE = `Palestinian Musakhan-style: taboon/flatbread base visible, generous onions, sumac, olive oil, chicken placed naturally on top, culturally authentic serving style.`;
