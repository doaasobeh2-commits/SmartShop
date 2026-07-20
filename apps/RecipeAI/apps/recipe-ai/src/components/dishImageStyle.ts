import type { CSSProperties } from "react";
import {
  isDishPlaceholderUrl,
  responsiveDishImageStyle,
  type DishFocalPoint,
} from "./responsiveDishImage";

export {
  isDishPlaceholderUrl,
  responsiveDishImageStyle,
  resolveDishObjectPosition,
} from "./responsiveDishImage";
export type { DishFocalPoint, DishImageCropPreset } from "./responsiveDishImage";

/**
 * Dish identity rendering — verified photos use cover + focal point;
 * placeholders use contain so the SVG label stays readable.
 */
export function dishBackgroundStyle(
  imageUrl: string,
  focal?: DishFocalPoint,
): CSSProperties {
  return responsiveDishImageStyle({ imageUrl, ...focal });
}
