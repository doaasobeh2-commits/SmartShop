import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISH_CROP_ASPECT_RATIO,
  dishImageContainerStyle,
  responsiveDishImageStyle,
  resolveDishObjectPosition,
} from "./responsiveDishImage";

describe("responsiveDishImage", () => {
  it("uses cover for verified dish photos", () => {
    const style = responsiveDishImageStyle({
      imageUrl: "/images/dishes/arab/fattoush.webp",
    });
    assert.equal(style.backgroundSize, "cover");
    assert.ok(style.backgroundImage?.includes("fattoush.webp"));
  });

  it("applies admin focal point metadata over catalog defaults", () => {
    const position = resolveDishObjectPosition("/images/dishes/arab/fattoush.webp", {
      focalPointX: 42,
      focalPointY: 68,
    });
    assert.equal(position, "42% 68%");
  });

  it("clamps focal point percentages to 0–100", () => {
    const position = resolveDishObjectPosition("/images/dishes/arab/fattoush.webp", {
      focalPointX: -5,
      focalPointY: 150,
    });
    assert.equal(position, "0% 100%");
  });

  it("defines distinct aspect ratios for admin crop presets", () => {
    assert.equal(DISH_CROP_ASPECT_RATIO["mobile-sm"], "4 / 3");
    assert.equal(DISH_CROP_ASPECT_RATIO["mobile-lg"], "16 / 10");
    assert.equal(DISH_CROP_ASPECT_RATIO.tablet, "16 / 9");
    assert.notEqual(
      DISH_CROP_ASPECT_RATIO["mobile-sm"],
      DISH_CROP_ASPECT_RATIO.tablet,
    );
  });

  it("container style preserves aspect ratio and overflow hidden", () => {
    const style = dishImageContainerStyle("16 / 9");
    assert.equal(style.aspectRatio, "16 / 9");
    assert.equal(style.overflow, "hidden");
    assert.equal(style.width, "100%");
  });
});
