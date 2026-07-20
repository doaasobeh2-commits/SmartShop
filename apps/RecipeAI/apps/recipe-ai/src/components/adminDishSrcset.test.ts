import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_DISH_SRCSET_WIDTHS,
  ADMIN_HERO_SIZES,
  ADMIN_PREVIEW_SIZES,
  adminDishImgStyle,
  buildAdminDishSrcset,
  dishResponsiveVariantUrl,
  toRootAbsoluteAssetUrl,
} from "./adminDishSrcset";
import { NEEDS_PHOTO_PLACEHOLDER_PATH } from "../data/catalog/imageAssets";

describe("adminDishSrcset", () => {
  it("exposes the stable width set 440 / 640 / 960", () => {
    assert.deepEqual([...ADMIN_DISH_SRCSET_WIDTHS], [440, 640, 960]);
  });

  it("derives variant URLs beside the source JPG without nesting", () => {
    assert.equal(
      dishResponsiveVariantUrl("/assets/dishes/arab/kibbeh-nayyeh.jpg", 440),
      "/assets/dishes/arab/kibbeh-nayyeh-w440.jpg",
    );
    assert.equal(
      dishResponsiveVariantUrl("/assets/dishes/arab/kibbeh-nayyeh.jpg", 960),
      "/assets/dishes/arab/kibbeh-nayyeh-w960.jpg",
    );
    assert.equal(
      dishResponsiveVariantUrl("/assets/dishes/arab/kibbeh-nayyeh-w640.jpg", 440),
      null,
    );
    // Must not produce image.jpg-w440.jpg
    assert.equal(
      dishResponsiveVariantUrl("assets/dishes/arab/kibbeh-nayyeh.jpg", 440),
      "/assets/dishes/arab/kibbeh-nayyeh-w440.jpg",
    );
  });

  it("normalizes asset URLs to root-absolute paths", () => {
    assert.equal(
      toRootAbsoluteAssetUrl("assets/dishes/arab/kibbeh-nayyeh.jpg"),
      "/assets/dishes/arab/kibbeh-nayyeh.jpg",
    );
    assert.equal(
      toRootAbsoluteAssetUrl("/assets/dishes/arab/kibbeh-nayyeh.jpg"),
      "/assets/dishes/arab/kibbeh-nayyeh.jpg",
    );
  });

  it("builds srcset with original as src and prebuilt width candidates", () => {
    const result = buildAdminDishSrcset(
      "/assets/dishes/arab/kibbeh-nayyeh.jpg",
      ADMIN_PREVIEW_SIZES,
    );
    assert.equal(result.usesVariants, true);
    // Original remains src so a missing variant cannot blank the image.
    assert.equal(result.src, "/assets/dishes/arab/kibbeh-nayyeh.jpg");
    assert.ok(result.srcSet?.includes("/assets/dishes/arab/kibbeh-nayyeh-w440.jpg 440w"));
    assert.ok(result.srcSet?.includes("/assets/dishes/arab/kibbeh-nayyeh-w640.jpg 640w"));
    assert.ok(result.srcSet?.includes("/assets/dishes/arab/kibbeh-nayyeh-w960.jpg 960w"));
    assert.equal(result.sizes, ADMIN_PREVIEW_SIZES);
  });

  it("skips srcset for placeholder images", () => {
    const result = buildAdminDishSrcset(
      `${NEEDS_PHOTO_PLACEHOLDER_PATH}?recipe=x`,
      ADMIN_HERO_SIZES,
    );
    assert.equal(result.usesVariants, false);
    assert.ok(!result.srcSet);
  });

  it("applies cover + focal object-position on the img style", () => {
    const style = adminDishImgStyle("/assets/dishes/arab/kibbeh-nayyeh.jpg", {
      focalPointX: 50,
      focalPointY: 50,
    });
    assert.equal(style.objectFit, "cover");
    assert.equal(style.objectPosition, "50% 50%");
  });

  it("keeps distinct hero vs preview sizes hints", () => {
    assert.notEqual(ADMIN_HERO_SIZES, ADMIN_PREVIEW_SIZES);
    assert.ok(ADMIN_PREVIEW_SIZES.includes("240px"));
    assert.ok(ADMIN_HERO_SIZES.includes("640px"));
  });
});
