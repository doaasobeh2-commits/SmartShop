/**
 * Catalog image integrity source of truth.
 *
 * Every recipeId maps to exactly one JPG at
 * `/assets/dishes/{cuisineFolder}/{recipeId}.jpg`
 *
 * Photos are identity-intended food photography (mix of originally inspected
 * assets and newly generated dish-specific images). Human photo QA before
 * marketing remains recommended — filenames alone are not proof of correctness.
 */
export const INSPECTED_CORRECT_RECIPE_IMAGE_IDS = [
  "aloo-gobi",
  "black-bean-soup",
  "cacik",
  "caprese",
  "chana-masala",
  "chicken-tinga",
  "cucumber-raita",
  "cucumber-salad-smashed",
  "dal-tadka",
  "dumplings",
  "eiernockerl",
  "egg-fried-rice",
  "ezogelin",
  "fattoush",
  "foul-medames",
  "garlic-rosemary-chicken",
  "ginger-soy-chicken",
  "guacamole-plates",
  "gulasch",
  "gurkensalat",
  "huevos-rancheros",
  "imam-bayildi",
  "jeera-rice",
  "kabsa-chicken",
  "kartoffelsuppe",
  "kofte",
  "mapo-tofu",
  "menemen",
  "mercimek-corbasi",
  "mexican-rice",
  "minestrone",
  "mujaddara",
  "mushroom-risotto",
  "paprika-chicken",
  "pasta-e-ceci",
  "pomodoro-pasta",
  "shorbat-adas",
  "street-tacos",
  "sumac-chicken",
  "tabbouleh",
  "tandoori-style-chicken",
  "tomato-egg-stirfry",
  "wiener-schnitzel",
] as const;

/** Recipes still lacking a verified identity-correct JPG — must stay empty when complete. */
export const NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS = [] as const;

const inspectedCorrect = new Set<string>(INSPECTED_CORRECT_RECIPE_IMAGE_IDS);

export const NEEDS_PHOTO_PLACEHOLDER_PATH =
  "/assets/dishes/_needs-photo.svg";

const CUISINE_FOLDER_BY_RECIPE: Record<string, string> = {
  kofte: "turkish",
  "mercimek-corbasi": "turkish",
  cacik: "turkish",
  menemen: "turkish",
  ezogelin: "turkish",
  "imam-bayildi": "turkish",
  "wiener-schnitzel": "central-european",
  gurkensalat: "central-european",
  kartoffelsuppe: "central-european",
  "paprika-chicken": "central-european",
  gulasch: "central-european",
  eiernockerl: "central-european",
  "pomodoro-pasta": "italian",
  minestrone: "italian",
  caprese: "italian",
  "garlic-rosemary-chicken": "italian",
  "mushroom-risotto": "italian",
  "pasta-e-ceci": "italian",
  dumplings: "chinese",
  "tomato-egg-stirfry": "chinese",
  "cucumber-salad-smashed": "chinese",
  "egg-fried-rice": "chinese",
  "ginger-soy-chicken": "chinese",
  "mapo-tofu": "chinese",
  "dal-tadka": "indian",
  "jeera-rice": "indian",
  "cucumber-raita": "indian",
  "aloo-gobi": "indian",
  "tandoori-style-chicken": "indian",
  "chana-masala": "indian",
  "street-tacos": "mexican",
  "black-bean-soup": "mexican",
  "mexican-rice": "mexican",
  "chicken-tinga": "mexican",
  "guacamole-plates": "mexican",
  "huevos-rancheros": "mexican",
};

export function cuisineFolderForRecipe(
  recipeId: string,
  cuisineFolder: string,
): string {
  return CUISINE_FOLDER_BY_RECIPE[recipeId] ?? cuisineFolder;
}

export function dishPhotoPath(
  cuisineFolder: string,
  recipeId: string,
  imageFile?: string,
): string {
  const fileName = imageFile ?? recipeId;
  if (inspectedCorrect.has(recipeId)) {
    const folder = cuisineFolderForRecipe(recipeId, cuisineFolder);
    return `/assets/dishes/${folder}/${fileName}.jpg`;
  }
  return `${NEEDS_PHOTO_PLACEHOLDER_PATH}?recipe=${encodeURIComponent(recipeId)}`;
}

/** Optional basename override when the JPG is not `{recipeId}.jpg`. */
const IMAGE_BASENAME_BY_RECIPE: Record<string, string> = {
  "sumac-chicken": "musakhan-wraps",
};

export const EXPECTED_DISH_IMAGE_PATHS: readonly string[] =
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS.map((id) => {
    const folder = CUISINE_FOLDER_BY_RECIPE[id] ?? "arab";
    const file = IMAGE_BASENAME_BY_RECIPE[id] ?? id;
    return `/assets/dishes/${folder}/${file}.jpg`;
  });

export function auditImageRegistryCounts(): {
  totalInspected: number;
  totalPlaceholder: number;
  totalExpected: number;
} {
  return {
    totalInspected: INSPECTED_CORRECT_RECIPE_IMAGE_IDS.length,
    totalPlaceholder: NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.length,
    totalExpected:
      INSPECTED_CORRECT_RECIPE_IMAGE_IDS.length +
      NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.length,
  };
}
