/**
 * Per-asset object-position for mobile cover crops.
 * Values are CSS background-position / object-position strings.
 * Do not assume one center crop works for every photo.
 */
export const IMAGE_FOCAL_POINTS: Record<string, string> = {
  // Onboarding heroes
  "/assets/onboarding/hero-kitchen-morning.jpg": "52% 42%",
  "/assets/onboarding/hero-kitchen-shared.jpg": "48% 40%",
  "/assets/onboarding/hero-family-table.jpg": "50% 58%",
  // Wreath flatlay — center is empty marble; keep ingredients in frame
  "/assets/onboarding/hero-fresh-ingredients.jpg": "50% 18%",
  "/assets/onboarding/hero-ingredients-spread.jpg": "50% 35%",
  "/assets/onboarding/hero-planning-notebook.jpg": "50% 46%",

  // Cuisine preference cards
  "/assets/onboarding/cuisine-arab.jpg": "50% 55%",
  "/assets/onboarding/cuisine-turkish.jpg": "50% 45%",
  "/assets/onboarding/cuisine-central-european.jpg": "50% 48%",
  "/assets/onboarding/cuisine-italian.jpg": "48% 42%",
  "/assets/onboarding/cuisine-chinese.jpg": "50% 50%",
  "/assets/onboarding/cuisine-indian.jpg": "50% 45%",
  "/assets/onboarding/cuisine-mexican.jpg": "50% 48%",

  // Dish catalog
  "/assets/dishes/arab/tabbouleh.jpg": "50% 48%",
  "/assets/dishes/arab/fattoush.jpg": "50% 45%",
  "/assets/dishes/arab/mujaddara.jpg": "50% 50%",
  "/assets/dishes/central-european/wiener-schnitzel.jpg": "48% 52%",
  "/assets/dishes/turkish/kofte.jpg": "50% 48%",
  "/assets/dishes/italian/pomodoro-pasta.jpg": "50% 45%",
  "/assets/dishes/chinese/dumplings.jpg": "46% 48%",
  "/assets/dishes/indian/dal-tadka.jpg": "50% 48%",
  "/assets/dishes/mexican/street-tacos.jpg": "42% 48%",
  // Temporary duplicate assets share focal points of their source photo
  "/assets/dishes/arab/shorbat-adas.jpg": "50% 48%",
  "/assets/dishes/arab/sumac-chicken.jpg": "50% 50%",
    "/assets/dishes/arab/musakhan-wraps.jpg": "50% 48%",
    "/assets/dishes/arab/syrian-meat-maqluba.jpg": "50% 50%",
    "/assets/dishes/arab/fattet-dajaj.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-savory-pastries.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-sfiha.jpg": "50% 50%",
    "/assets/dishes/arab/spinach-fatayer.jpg": "50% 50%",
    "/assets/dishes/arab/shish-barak.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-ouzi.jpg": "50% 50%",
    "/assets/dishes/arab/bamieh-bil-lahmeh.jpg": "50% 50%",
    "/assets/dishes/arab/basha-wa-asakro.jpg": "50% 50%",
    "/assets/dishes/arab/beetroot-mutabbal.jpg": "50% 50%",
    "/assets/dishes/arab/shakriyeh-with-rice.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-molokhia-with-chicken.jpg": "50% 50%",
    "/assets/dishes/arab/fasolia-bi-zeit.jpg": "50% 50%",
    "/assets/dishes/arab/artichoke-salad.jpg": "50% 50%",
    "/assets/dishes/arab/peas-with-tomato.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-stuffed-chicken.jpg": "50% 50%",
    "/assets/dishes/arab/freekeh-with-meat.jpg": "50% 50%",
    "/assets/dishes/arab/harraq-esbao.jpg": "50% 50%",
    "/assets/dishes/arab/macarona-bil-lahmeh.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-boiled-potato-salad.jpg": "50% 50%",
    "/assets/dishes/arab/dawood-basha.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-stuffed-cabbage-stew.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-cauliflower-with-meat.jpg": "50% 50%",
    "/assets/dishes/arab/syrian-potato-garlic-olive-oil-stew.jpg": "50% 50%",
    "/assets/dishes/arab/tunisian-couscous-with-meat-and-vegetables.jpg": "50% 50%",
    "/assets/dishes/arab/moroccan-meat-tagine-with-prunes.jpg": "50% 50%",
    "/assets/dishes/arab/moroccan-chicken-with-preserved-lemon-and-olives.jpg": "50% 50%",
    "/assets/dishes/arab/lebanese-batata-harra.jpg": "50% 50%",
    "/assets/dishes/arab/kabsa-chicken.jpg": "50% 45%",
  "/assets/dishes/turkish/mercimek-corbasi.jpg": "50% 48%",
  "/assets/dishes/turkish/cacik.jpg": "50% 48%",
  "/assets/dishes/turkish/menemen.jpg": "50% 48%",
  "/assets/dishes/turkish/ezogelin.jpg": "50% 48%",
  "/assets/dishes/central-european/gurkensalat.jpg": "48% 52%",
  "/assets/dishes/central-european/kartoffelsuppe.jpg": "48% 52%",
  "/assets/dishes/central-european/paprika-chicken.jpg": "48% 52%",
  "/assets/dishes/central-european/gulasch.jpg": "48% 52%",
  "/assets/dishes/italian/minestrone.jpg": "50% 45%",
  "/assets/dishes/italian/caprese.jpg": "50% 45%",
  "/assets/dishes/italian/garlic-rosemary-chicken.jpg": "50% 45%",
  "/assets/dishes/italian/mushroom-risotto.jpg": "50% 45%",
  "/assets/dishes/chinese/tomato-egg-stirfry.jpg": "46% 48%",
  "/assets/dishes/chinese/cucumber-salad-smashed.jpg": "46% 48%",
  "/assets/dishes/chinese/egg-fried-rice.jpg": "46% 48%",
  "/assets/dishes/chinese/ginger-soy-chicken.jpg": "46% 48%",
  "/assets/dishes/indian/jeera-rice.jpg": "50% 48%",
  "/assets/dishes/indian/cucumber-raita.jpg": "50% 48%",
  "/assets/dishes/indian/aloo-gobi.jpg": "50% 48%",
  "/assets/dishes/indian/tandoori-style-chicken.jpg": "50% 48%",
  "/assets/dishes/mexican/black-bean-soup.jpg": "42% 48%",
  "/assets/dishes/mexican/mexican-rice.jpg": "42% 48%",
  "/assets/dishes/mexican/chicken-tinga.jpg": "42% 48%",
  "/assets/dishes/mexican/guacamole-plates.jpg": "42% 48%",
};

export function imageObjectPosition(imageUrl: string | undefined): string {
  if (!imageUrl) return "50% 50%";
  return IMAGE_FOCAL_POINTS[imageUrl] ?? "50% 50%";
}
