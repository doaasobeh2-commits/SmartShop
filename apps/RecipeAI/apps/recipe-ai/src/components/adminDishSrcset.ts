/**
 * Admin-only responsive dish image helpers.
 *
 * Uses prebuilt width variants (*-w440.jpg, *-w640.jpg, *-w960.jpg) so the
 * browser can pick a near-target source instead of crushing the full-resolution
 * JPG into a small CSS box (which amplifies AI texture sparkle).
 *
 * Consumer/catalog surfaces are untouched — they keep the existing background
 * cover path until a later pass.
 */

import type { CSSProperties } from "react";
import {
  isDishPlaceholderUrl,
  resolveDishObjectPosition,
  type DishFocalPoint,
} from "./responsiveDishImage";

/** Prebuilt responsive widths (CSS px targets; browser may pick 2× for DPR). */
export const ADMIN_DISH_SRCSET_WIDTHS = [440, 640, 960] as const;

export type AdminDishSrcsetWidth = (typeof ADMIN_DISH_SRCSET_WIDTHS)[number];

/** Ensure asset URLs are root-absolute so nested Admin routes cannot resolve them relatively. */
export function toRootAbsoluteAssetUrl(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  const qIndex = imageUrl.indexOf("?");
  const pathPart = qIndex >= 0 ? imageUrl.slice(0, qIndex) : imageUrl;
  const query = qIndex >= 0 ? imageUrl.slice(qIndex) : "";
  if (/^https?:\/\//i.test(pathPart) || pathPart.startsWith("//")) {
    return imageUrl;
  }
  const normalized = pathPart.replace(/^\.\//, "").replace(/^\/+/, "");
  return `/${normalized}${query}`;
}

/** Derive `/path/name-w440.jpg` from `/path/name.jpg`. */
export function dishResponsiveVariantUrl(
  imageUrl: string,
  width: AdminDishSrcsetWidth,
): string | null {
  if (!imageUrl || isDishPlaceholderUrl(imageUrl)) return null;
  const absolute = toRootAbsoluteAssetUrl(imageUrl);
  const qIndex = absolute.indexOf("?");
  const base = qIndex >= 0 ? absolute.slice(0, qIndex) : absolute;
  const query = qIndex >= 0 ? absolute.slice(qIndex) : "";
  if (!/\.jpe?g$/i.test(base)) return null;
  // Already a variant — do not nest (`name-w440.jpg`, not `name.jpg-w440.jpg`).
  if (/-w\d+\.jpe?g$/i.test(base)) return null;
  return base.replace(/\.jpe?g$/i, `-w${width}.jpg`) + query;
}

export type AdminDishSrcsetResult = {
  /** Default src — mid-size when variants exist, else original. */
  src: string;
  srcSet?: string;
  sizes: string;
  /** True when width variants were attached. */
  usesVariants: boolean;
};

/**
 * Build src/srcset/sizes for Admin review surfaces.
 * `sizes` should match the approximate CSS layout width of the image box.
 */
export function buildAdminDishSrcset(
  imageUrl: string,
  sizes: string,
): AdminDishSrcsetResult {
  if (!imageUrl || isDishPlaceholderUrl(imageUrl)) {
    return { src: imageUrl || "", sizes, usesVariants: false };
  }

  // Always keep the original as `src` so a missing variant cannot blank the img.
  // The browser selects from srcset when present; original remains the fallback.
  const original = toRootAbsoluteAssetUrl(imageUrl);

  const entries: string[] = [];
  for (const width of ADMIN_DISH_SRCSET_WIDTHS) {
    const variant = dishResponsiveVariantUrl(original, width);
    if (variant) entries.push(`${variant} ${width}w`);
  }

  if (entries.length === 0) {
    return { src: original, sizes, usesVariants: false };
  }

  return {
    src: original,
    srcSet: entries.join(", "),
    sizes,
    usesVariants: true,
  };
}

/** Layout sizes for the Admin detail hero (left column ≈ 40–50vw). */
export const ADMIN_HERO_SIZES =
  "(min-width: 1024px) min(640px, 42vw), min(100vw, 720px)";

/**
 * Layout sizes for each Responsive Image Review cell
 * (3-col grid ≈ 200–240 CSS px on desktop).
 */
export const ADMIN_PREVIEW_SIZES =
  "(min-width: 640px) min(240px, 28vw), min(100vw, 420px)";

export function adminDishImgStyle(
  imageUrl: string,
  focal?: DishFocalPoint,
): CSSProperties {
  return {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: resolveDishObjectPosition(imageUrl, focal),
    display: "block",
  };
}
