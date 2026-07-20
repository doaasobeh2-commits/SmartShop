import type { CSSProperties } from "react";
import { useState } from "react";
import {
  ADMIN_HERO_SIZES,
  ADMIN_PREVIEW_SIZES,
  adminDishImgStyle,
  buildAdminDishSrcset,
} from "./adminDishSrcset";
import {
  dishImageContainerStyle,
  DISH_CROP_ASPECT_RATIO,
  type DishFocalPoint,
  type DishImageCropPreset,
} from "./responsiveDishImage";

export type AdminDishImageProps = DishFocalPoint & {
  imageUrl: string;
  alt: string;
  /** Crop aspect preset — same as ResponsiveDishImage. */
  preset?: DishImageCropPreset;
  aspectRatio?: string;
  className?: string;
  /**
   * Layout role: picks `sizes` so the browser selects 440 / 640 / 960
   * without over-downscaling a full-res source into a tiny box.
   */
  layout?: "hero" | "preview";
  /** Override sizes if a custom layout width is known. */
  sizes?: string;
};

/**
 * Admin review image surface — semantic img with object-fit:cover,
 * focal-point object-position, and srcset width variants.
 *
 * Filename deliberately avoids `AdminResponsiveDishImage` so it cannot collide
 * on case-insensitive filesystems with a deleted `adminResponsiveDishImage.ts`
 * helper (that collision caused Vite 404s for the helper module).
 */
export function AdminDishImage({
  imageUrl,
  alt,
  preset = "hero",
  aspectRatio,
  className = "",
  layout = "hero",
  sizes: sizesOverride,
  focalPointX,
  focalPointY,
}: AdminDishImageProps) {
  const ratio = aspectRatio ?? DISH_CROP_ASPECT_RATIO[preset];
  const containerStyle: CSSProperties = dishImageContainerStyle(ratio);
  const sizes =
    sizesOverride ??
    (layout === "preview" ? ADMIN_PREVIEW_SIZES : ADMIN_HERO_SIZES);
  const built = buildAdminDishSrcset(imageUrl, sizes);
  const imgStyle = adminDishImgStyle(imageUrl, { focalPointX, focalPointY });
  const [dropSrcset, setDropSrcset] = useState(false);

  return (
    <div className={`relative ${className}`.trim()} style={containerStyle}>
      <img
        src={built.src}
        srcSet={dropSrcset ? undefined : built.srcSet}
        sizes={dropSrcset ? undefined : built.sizes}
        alt={alt}
        style={imgStyle}
        className="absolute inset-0"
        decoding="async"
        onError={() => {
          // If a srcset candidate 404s, retry with the original JPG only.
          if (!dropSrcset && built.usesVariants) setDropSrcset(true);
        }}
      />
    </div>
  );
}
