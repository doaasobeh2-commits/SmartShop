/**
 * Curated, human-authored recipe generation fixtures for Recipe Studio.
 *
 * These are NOT scraped from copyrighted sources — they are original,
 * culturally cross-checked recipe descriptions written for the ShareYum
 * generation layer. The local authored provider returns these when a live
 * AI provider is not connected. Generated results always enter Recipe QA
 * Draft + Photo QA Pending and require explicit human review.
 */

import type { CuisineFamilyId } from "@recipe-ai/core/types";
import type { AppLocale } from "../i18n/types";
import type {
  BudgetTier,
  CatalogAllergen,
  DietaryTag,
  DishDifficulty,
  DishMood,
  MealIntentTag,
  MealSlotRole,
  MealType,
  PantryIngredient,
  ProteinCategory,
  SuitabilityTag,
} from "../data/catalog/types";
import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import type {
  DefaultMealRole,
  NaturalYieldModel,
  StudioEditableIngredient,
  StudioLocaleCopy,
} from "./recipeStudioTypes";
import { ARAB_BATCH_1 } from "./arabBatch1Library";
import { ARAB_BATCH_2_GROUP_1 } from "./arabBatch2Group1Library";
import { ARAB_BATCH_2_GROUP_2 } from "./arabBatch2Group2Library";

export type GeneratedRecipePhotoBrief = {
  brief: string;
  platingNotes: string;
  culturalAuthenticityNotes: string;
  focalPointX: number;
  focalPointY: number;
  imageQualityGuidance: string;
  /** Prepared asset path when an image already exists; undefined = none yet. */
  preparedImageUrl?: string;
};

export type GeneratedRecipe = {
  /** Normalized dish-name aliases this fixture answers to. */
  matchKeys: string[];
  canonicalTitle: string;
  cuisineFamilyId: CuisineFamilyId;
  regionSubcuisine: string;
  prepMinutes: number;
  difficulty: DishDifficulty;
  servings: number;
  mealTypes: MealType[];
  mealSlotRole: MealSlotRole;
  mealIntents: MealIntentTag[];
  proteinCategory: ProteinCategory;
  budgetTier: BudgetTier;
  suitability: SuitabilityTag[];
  moods: DishMood[];
  dietaryTags: DietaryTag[];
  allergens: CatalogAllergen[];
  mayContain: CatalogAllergen[];
  allergenDeclared: boolean;
  ingredientTokens: string[];
  pantryIngredients: PantryIngredient[];
  ingredients: StudioEditableIngredient[];
  localeCopy: Record<AppLocale, StudioLocaleCopy>;
  naturalYield: NaturalYieldModel;
  defaultRole: DefaultMealRole;
  canServeAsMain: boolean;
  photo: GeneratedRecipePhotoBrief;
};

/** Lowercase, strip punctuation/diacritics-ish and collapse whitespace. */
export function normalizeDishName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const BABA_GHANOUJ: GeneratedRecipe = {
  matchKeys: [
    "baba ghanouj",
    "baba ghanoush",
    "baba ganoush",
    "baba ganouj",
    "baba gannouj",
    "بابا غنوج",
    "بابا غنوش",
  ].map(normalizeDishName),
  canonicalTitle: "Baba Ghanouj",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 45,
  difficulty: "easy",
  servings: 4,
  mealTypes: ["side"],
  mealSlotRole: "side_component",
  mealIntents: ["healthy", "budget", "family_friendly"],
  proteinCategory: "vegetable",
  budgetTier: "low",
  suitability: ["everyday_host", "shareable", "guest_friendly"],
  moods: ["everyday"],
  dietaryTags: ["vegetarian_ok", "vegan_ok"],
  allergens: ["Sesame"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: [
    "eggplant",
    "tomato",
    "green pepper",
    "tahini",
    "lemon",
    "garlic",
    "olive oil",
    "parsley",
    "sumac",
  ],
  pantryIngredients: [
    { canonicalId: "eggplant", role: "critical", tokens: ["eggplant", "aubergine"] },
    { canonicalId: "tahini", role: "critical", tokens: ["tahini", "sesame paste"] },
    { canonicalId: "tomato", role: "supporting", tokens: ["tomato"] },
    { canonicalId: "green-pepper", role: "supporting", tokens: ["green pepper", "pepper"] },
    { canonicalId: "lemon", role: "supporting", tokens: ["lemon", "lemon juice"] },
    { canonicalId: "garlic", role: "supporting", tokens: ["garlic"] },
    { canonicalId: "olive-oil", role: "supporting", tokens: ["olive oil", "olive"] },
    { canonicalId: "parsley", role: "garnish", tokens: ["parsley"] },
    { canonicalId: "sumac", role: "garnish", tokens: ["sumac"] },
  ],
  ingredients: [
    {
      id: "eggplant",
      en: "Eggplant",
      de: "Aubergine",
      ar: "باذنجان",
      tr: "Patlıcan",
      detailEn: "2 large (about 900 g), roasted and peeled",
      detailDe: "2 große (ca. 900 g), geröstet und geschält",
      detailAr: "حبتان كبيرتان (حوالي 900 غرام)، مشويتان ومقشرتان",
      detailTr: "2 büyük (yaklaşık 900 g), közlenmiş ve kabuğu soyulmuş",
      status: "need",
    },
    {
      id: "tomato",
      en: "Fresh tomato",
      de: "Frische Tomate",
      ar: "طماطم طازجة",
      tr: "Taze domates",
      detailEn: "1 small, finely diced (a small, balanced amount)",
      detailDe: "1 kleine, fein gewürfelt (eine kleine, ausgewogene Menge)",
      detailAr: "حبة صغيرة، مقطعة ناعماً (كمية صغيرة ومتوازنة)",
      detailTr: "1 küçük, ince doğranmış (küçük, dengeli bir miktar)",
      status: "need",
    },
    {
      id: "green-pepper",
      en: "Green pepper",
      de: "Grüne Paprika",
      ar: "فلفل أخضر",
      tr: "Yeşil biber",
      detailEn: "½ small, finely diced (a small, balanced amount)",
      detailDe: "½ kleine, fein gewürfelt (eine kleine, ausgewogene Menge)",
      detailAr: "نصف حبة صغيرة، مقطعة ناعماً (كمية صغيرة ومتوازنة)",
      detailTr: "½ küçük, ince doğranmış (küçük, dengeli bir miktar)",
      status: "need",
    },
    {
      id: "tahini",
      en: "Tahini (sesame paste)",
      de: "Tahini (Sesampaste)",
      ar: "طحينة",
      tr: "Tahin (susam ezmesi)",
      detailEn: "2 tbsp",
      detailDe: "2 EL",
      detailAr: "ملعقتان كبيرتان",
      detailTr: "2 yemek kaşığı",
      status: "need",
    },
    {
      id: "lemon-juice",
      en: "Lemon juice",
      de: "Zitronensaft",
      ar: "عصير ليمون",
      tr: "Limon suyu",
      detailEn: "2 tbsp (about 1 lemon)",
      detailDe: "2 EL (etwa 1 Zitrone)",
      detailAr: "ملعقتان كبيرتان (حوالي ليمونة واحدة)",
      detailTr: "2 yemek kaşığı (yaklaşık 1 limon)",
      status: "need",
    },
    {
      id: "garlic",
      en: "Garlic",
      de: "Knoblauch",
      ar: "ثوم",
      tr: "Sarımsak",
      detailEn: "1 clove, crushed to a paste with salt",
      detailDe: "1 Zehe, mit Salz zu Paste zerdrückt",
      detailAr: "فص واحد، مهروس مع الملح",
      detailTr: "1 diş, tuz ile ezilerek",
      status: "need",
    },
    {
      id: "olive-oil",
      en: "Extra-virgin olive oil",
      de: "Natives Olivenöl extra",
      ar: "زيت زيتون بكر ممتاز",
      tr: "Sızma zeytinyağı",
      detailEn: "2 tbsp, plus extra to finish",
      detailDe: "2 EL, plus etwas zum Beträufeln",
      detailAr: "ملعقتان كبيرتان، مع القليل للتزيين",
      detailTr: "2 yemek kaşığı, üzeri için biraz daha",
      status: "need",
    },
    {
      id: "salt",
      en: "Salt",
      de: "Salz",
      ar: "ملح",
      tr: "Tuz",
      detailEn: "½ tsp, to taste",
      detailDe: "½ TL, nach Geschmack",
      detailAr: "½ ملعقة صغيرة، حسب الذوق",
      detailTr: "½ çay kaşığı, damak tadına göre",
      status: "need",
    },
    {
      id: "parsley",
      en: "Fresh flat-leaf parsley",
      de: "Glatte Petersilie",
      ar: "بقدونس طازج",
      tr: "Taze maydanoz",
      detailEn: "1 tbsp, chopped (to garnish)",
      detailDe: "1 EL, gehackt (zum Garnieren)",
      detailAr: "ملعقة كبيرة، مفرومة (للتزيين)",
      detailTr: "1 yemek kaşığı, doğranmış (süsleme için)",
      status: "need",
    },
    {
      id: "sumac",
      en: "Ground sumac",
      de: "Sumach",
      ar: "سماق",
      tr: "Sumak",
      detailEn: "1 pinch (to garnish)",
      detailDe: "1 Prise (zum Garnieren)",
      detailAr: "رشة (للتزيين)",
      detailTr: "1 tutam (süsleme için)",
      status: "need",
    },
    {
      id: "flatbread",
      en: "Arabic flatbread",
      de: "Arabisches Fladenbrot",
      ar: "خبز عربي",
      tr: "Arap pidesi/lavaş",
      detailEn: "to serve alongside",
      detailDe: "zum Servieren dazu",
      detailAr: "للتقديم إلى جانبه",
      detailTr: "yanında servis için",
      status: "need",
    },
  ],
  localeCopy: {
    en: {
      reason:
        "Syrian-style smoky mezze of flame-roasted eggplant folded with tahini, lemon, and garlic, brightened by a small, balanced amount of finely diced fresh tomato and green pepper — served with Arabic flatbread.",
      cuisineLabel: "Syrian",
      tips: [
        "Char the eggplant directly over a flame for the essential smoky flavour.",
        "Keep the tomato and green pepper finely diced and modest so they complement, not overpower, the eggplant.",
        "Drain the roasted flesh well and mash by hand — avoid a blender — to keep the texture.",
      ],
      storageTip:
        "Keeps in an airtight container in the fridge for up to 2 days; the fresh tomato and pepper are best added the same day. Bring to room temperature and stir before serving.",
      steps: [
        "Roast 2 whole eggplants directly over an open flame or under a hot broiler, turning often, until the skins are blackened and the flesh is completely soft, 20–30 minutes.",
        "Let the eggplants cool slightly, then peel away the charred skin. Put the flesh in a colander and drain 10–15 minutes to remove bitter juices.",
        "Mash the drained eggplant with a fork or knife to a coarse, textured paste — do not use a blender, to keep the smoky character.",
        "Crush the garlic with a pinch of salt, then stir in the tahini and lemon juice until the mixture is creamy.",
        "Gently fold in the finely diced tomato and green pepper, keeping them a small, balanced amount. Season with salt and adjust the lemon; the eggplant should stay dominant and smoky.",
        "Spread on a plate, make a shallow well, and finish with a drizzle of extra-virgin olive oil, a light dusting of sumac, and chopped parsley. Serve at room temperature with warm Arabic flatbread.",
      ],
    },
    de: {
      reason:
        "Rauchiges Mezze nach syrischer Art aus über der Flamme gerösteten Auberginen mit Tahini, Zitrone und Knoblauch, verfeinert mit einer kleinen, ausgewogenen Menge fein gewürfelter frischer Tomate und grüner Paprika – serviert mit arabischem Fladenbrot.",
      cuisineLabel: "Syrisch",
      tips: [
        "Auberginen direkt über der Flamme rösten für das typische Raucharoma.",
        "Tomate und grüne Paprika fein würfeln und sparsam einsetzen, damit sie die Aubergine ergänzen, nicht überdecken.",
        "Das geröstete Fruchtfleisch gut abtropfen lassen und von Hand zerdrücken – keinen Mixer verwenden – für die Textur.",
      ],
      storageTip:
        "Hält luftdicht verschlossen im Kühlschrank bis zu 2 Tage; frische Tomate und Paprika am besten am selben Tag zugeben. Vor dem Servieren auf Raumtemperatur bringen und umrühren.",
      steps: [
        "2 ganze Auberginen direkt über offener Flamme oder unter dem heißen Grill rösten, dabei oft wenden, bis die Haut schwarz und das Fruchtfleisch ganz weich ist, 20–30 Minuten.",
        "Auberginen etwas abkühlen lassen, dann die verkohlte Haut abziehen. Das Fruchtfleisch in ein Sieb geben und 10–15 Minuten abtropfen lassen, um bittere Flüssigkeit zu entfernen.",
        "Das abgetropfte Auberginenfleisch mit Gabel oder Messer zu einer groben, texturierten Paste zerdrücken – keinen Mixer verwenden, um das Raucharoma zu bewahren.",
        "Den Knoblauch mit einer Prise Salz zerdrücken, dann Tahini und Zitronensaft unterrühren, bis die Masse cremig ist.",
        "Die fein gewürfelte Tomate und grüne Paprika vorsichtig unterheben, in kleiner, ausgewogener Menge. Mit Salz würzen und die Zitrone anpassen; die Aubergine soll dominant und rauchig bleiben.",
        "Auf einem Teller verstreichen, eine flache Mulde formen und mit nativem Olivenöl extra, etwas Sumach und gehackter Petersilie vollenden. Bei Raumtemperatur mit warmem arabischem Fladenbrot servieren.",
      ],
    },
    ar: {
      reason:
        "مزة شامية مدخنة من الباذنجان المشوي على النار مع الطحينة والليمون والثوم، مع كمية صغيرة ومتوازنة من الطماطم والفلفل الأخضر المقطعين ناعماً — تُقدَّم مع الخبز العربي.",
      cuisineLabel: "سوري",
      tips: [
        "اشوِ الباذنجان مباشرة على النار للحصول على النكهة المدخنة الأساسية.",
        "اجعل الطماطم والفلفل الأخضر مقطعين ناعماً وبكمية قليلة حتى يكمّلا الباذنجان دون أن يطغيا عليه.",
        "صفِّ لب الباذنجان جيداً واهرسه باليد — تجنب الخلاط — للحفاظ على القوام.",
      ],
      storageTip:
        "يُحفظ في وعاء محكم في الثلاجة حتى يومين؛ يُفضَّل إضافة الطماطم والفلفل الطازجين في اليوم نفسه. أخرجه إلى حرارة الغرفة وحرّكه قبل التقديم.",
      steps: [
        "اشوِ حبتين من الباذنجان كاملتين مباشرة على النار أو تحت الشواية الساخنة مع التقليب حتى يسودّ القشر وينضج اللب تماماً، من 20 إلى 30 دقيقة.",
        "اترك الباذنجان ليبرد قليلاً ثم انزع القشر المحروق. ضع اللب في مصفاة واتركه يصفّى من 10 إلى 15 دقيقة للتخلص من العصارة المرة.",
        "اهرس لب الباذنجان المصفّى بالشوكة أو السكين حتى يصبح عجينة خشنة القوام — لا تستخدم الخلاط للحفاظ على النكهة المدخنة.",
        "اهرس الثوم مع رشة ملح، ثم أضف الطحينة وعصير الليمون وحرّك حتى يصبح الخليط كريمياً.",
        "أضف الطماطم والفلفل الأخضر المقطعين ناعماً وقلّبهما برفق بكمية صغيرة ومتوازنة. تبّل بالملح وعدّل الليمون؛ يجب أن يبقى الباذنجان هو الغالب بنكهته المدخنة.",
        "افرده في طبق واصنع حفرة سطحية، ثم زيّنه بزيت الزيتون البكر ورشة سماق وبقدونس مفروم. قدّمه بحرارة الغرفة مع خبز عربي دافئ.",
      ],
    },
    tr: {
      reason:
        "Ateşte közlenmiş patlıcanın tahin, limon ve sarımsakla harmanlandığı, küçük ve dengeli miktarda ince doğranmış taze domates ve yeşil biberle canlandırılmış Suriye usulü dumanlı bir meze — Arap pidesiyle servis edilir.",
      cuisineLabel: "Suriye",
      tips: [
        "Patlıcanı doğrudan ateşte közleyin; dumanlı aroma bunun için şart.",
        "Domates ve yeşil biberi ince doğrayın ve az kullanın; patlıcanı bastırmadan tamamlasınlar.",
        "Közlenmiş içini iyice süzün ve blender yerine elle ezin; dokusu korunur.",
      ],
      storageTip:
        "Hava almayan bir kapta buzdolabında 2 güne kadar durur; taze domates ve biberi ayni gün eklemek en iyisidir. Servisten önce oda sıcaklığına getirip karıştırın.",
      steps: [
        "2 bütün patlıcanı doğrudan ateşte ya da kızgın ızgara altında, sık sık çevirerek, kabukları kararıp içi tamamen yumuşayana kadar 20–30 dakika közleyin.",
        "Patlıcanları biraz soğutun, ardından yanmış kabuğunu soyun. İçini bir süzgece alıp acı suyunu bırakması için 10–15 dakika süzün.",
        "Süzülen patlıcanı, dumanlı tadını korumak için blender kullanmadan, çatal veya bıçakla kaba dokulu bir ezme olana dek ezin.",
        "Sarımsağı bir tutam tuzla ezin, sonra tahin ve limon suyunu ekleyip karışım kremamsı olana kadar karıştırın.",
        "İnce doğranmış domates ve yeşil biberi, küçük ve dengeli bir miktarda olacak şekilde nazikçe karıştırın. Tuzla tatlandırıp limonu ayarlayın; patlıcan baskın ve dumanlı kalmalı.",
        "Bir tabağa yayıp sığ bir çukur açın; sızma zeytinyağı, bir tutam sumak ve doğranmış maydanozla tamamlayın. Oda sıcaklığında sıcak Arap pidesiyle servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 3,
    baseServingsMax: 4,
    servingLabel: "3–4 people as a shared mezze / side",
    scalingNote:
      "Scale up by adding more roasted eggplant first — it is the main volume ingredient. Increase the diced tomato and green pepper only slightly so they stay a small accent, then raise tahini, lemon, and garlic gradually and re-season with salt to taste rather than multiplying everything at once.",
  },
  defaultRole: "side",
  canServeAsMain: false,
  photo: {
    brief:
      "Photorealistic warm natural food photography of authentic Syrian-style Baba Ghanouj mezze: creamy smoky mashed roasted eggplant in a shallow rustic bowl with visible roasted-eggplant texture, folded with a small, balanced amount of finely diced fresh tomato and green pepper (small recognizable pieces, not overpowering), a natural drizzle of golden olive oil, and a restrained garnish of parsley and a little sumac. A few pieces of warm Arabic flatbread served alongside. No pomegranate, no excessive decoration, no text, no people.",
    platingNotes:
      "Shallow bowl, coarse smoky eggplant surface flecked with small tomato and green-pepper pieces; shallow well of olive oil; restrained parsley and sumac. Warm Arabic flatbread beside the bowl. Keep the complete dish centered.",
    culturalAuthenticityNotes:
      "Syrian (Levantine) mezze. Flame-roasted (smoky) eggplant stays dominant; finely diced fresh tomato and green pepper are a small, balanced accent. Tahini-based — never mayonnaise. Served at room temperature with olive oil on top and warm Arabic flatbread. Garnish stays restrained and authentic.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/baba-ghanouj.jpg",
  },
};

const YALANJI: GeneratedRecipe = {
  matchKeys: [
    "yalanji",
    "yalangi",
    "yalanci",
    "yalanji warak enab",
    "warak enab yalanji",
    "يالنجي",
    "يالنجى",
  ].map(normalizeDishName),
  canonicalTitle: "Yalanji",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 90,
  difficulty: "medium",
  servings: 5,
  mealTypes: ["side"],
  mealSlotRole: "side_component",
  mealIntents: ["healthy", "budget", "family_friendly"],
  proteinCategory: "vegetable",
  budgetTier: "low",
  suitability: ["everyday_host", "shareable", "guest_friendly"],
  moods: ["everyday"],
  dietaryTags: ["vegetarian_ok", "vegan_ok"],
  allergens: [],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: [
    "grape leaves",
    "rice",
    "onion",
    "tomato",
    "tomato paste",
    "parsley",
    "mint",
    "pomegranate molasses",
    "lemon",
    "olive oil",
    "allspice",
  ],
  pantryIngredients: [
    {
      canonicalId: "grape-leaves",
      role: "critical",
      tokens: ["grape leaves", "grape leaf", "vine leaves"],
    },
    { canonicalId: "rice", role: "critical", tokens: ["rice"] },
    {
      canonicalId: "pomegranate-molasses",
      role: "critical",
      tokens: ["pomegranate molasses", "pomegranate"],
    },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
    { canonicalId: "tomato", role: "supporting", tokens: ["tomato"] },
    { canonicalId: "parsley", role: "supporting", tokens: ["parsley"] },
    { canonicalId: "mint", role: "supporting", tokens: ["mint"] },
    { canonicalId: "lemon", role: "supporting", tokens: ["lemon", "lemon juice"] },
    { canonicalId: "olive-oil", role: "supporting", tokens: ["olive oil", "olive"] },
  ],
  ingredients: [
    {
      id: "grape-leaves",
      en: "Grape (vine) leaves",
      de: "Weinblätter",
      ar: "ورق عنب",
      tr: "Asma yaprağı",
      detailEn: "about 40 leaves (250 g), brined or fresh, rinsed",
      detailDe: "ca. 40 Blätter (250 g), eingelegt oder frisch, abgespült",
      detailAr: "حوالي 40 ورقة (250 غرام)، مخللة أو طازجة، مغسولة",
      detailTr: "yaklaşık 40 yaprak (250 g), salamura veya taze, yıkanmış",
      status: "need",
    },
    {
      id: "rice",
      en: "Short/medium-grain rice",
      de: "Rund-/Mittelkornreis",
      ar: "أرز قصير/متوسط الحبة",
      tr: "Kısa/orta taneli pirinç",
      detailEn: "1 cup (200 g), rinsed",
      detailDe: "1 Tasse (200 g), abgespült",
      detailAr: "كوب واحد (200 غرام)، مغسول",
      detailTr: "1 su bardağı (200 g), yıkanmış",
      status: "need",
    },
    {
      id: "onion",
      en: "Onion",
      de: "Zwiebel",
      ar: "بصل",
      tr: "Soğan",
      detailEn: "1 large, finely chopped",
      detailDe: "1 große, fein gehackt",
      detailAr: "حبة كبيرة، مفرومة ناعماً",
      detailTr: "1 büyük, ince doğranmış",
      status: "need",
    },
    {
      id: "tomato",
      en: "Fresh tomato",
      de: "Frische Tomate",
      ar: "طماطم طازجة",
      tr: "Taze domates",
      detailEn: "1 medium, finely diced",
      detailDe: "1 mittelgroße, fein gewürfelt",
      detailAr: "حبة متوسطة، مقطعة ناعماً",
      detailTr: "1 orta boy, ince doğranmış",
      status: "need",
    },
    {
      id: "tomato-paste",
      en: "Tomato paste",
      de: "Tomatenmark",
      ar: "معجون طماطم",
      tr: "Salça",
      detailEn: "1 tbsp",
      detailDe: "1 EL",
      detailAr: "ملعقة كبيرة",
      detailTr: "1 yemek kaşığı",
      status: "need",
    },
    {
      id: "parsley",
      en: "Flat-leaf parsley",
      de: "Glatte Petersilie",
      ar: "بقدونس",
      tr: "Maydanoz",
      detailEn: "1 cup, finely chopped",
      detailDe: "1 Tasse, fein gehackt",
      detailAr: "كوب واحد، مفروم ناعماً",
      detailTr: "1 su bardağı, ince doğranmış",
      status: "need",
    },
    {
      id: "mint",
      en: "Fresh mint",
      de: "Frische Minze",
      ar: "نعناع طازج",
      tr: "Taze nane",
      detailEn: "2 tbsp, chopped (or 1 tsp dried)",
      detailDe: "2 EL, gehackt (oder 1 TL getrocknet)",
      detailAr: "ملعقتان كبيرتان، مفروم (أو ملعقة صغيرة مجفف)",
      detailTr: "2 yemek kaşığı, doğranmış (veya 1 tatlı kaşığı kuru)",
      status: "need",
    },
    {
      id: "pomegranate-molasses",
      en: "Pomegranate molasses",
      de: "Granatapfelmelasse",
      ar: "دبس رمان",
      tr: "Nar ekşisi",
      detailEn: "2–3 tbsp (key sweet-sour note)",
      detailDe: "2–3 EL (zentrale süß-saure Note)",
      detailAr: "2–3 ملاعق كبيرة (نكهة الحلو-الحامض الأساسية)",
      detailTr: "2–3 yemek kaşığı (temel tatlı-ekşi nota)",
      status: "need",
    },
    {
      id: "lemon-juice",
      en: "Lemon juice",
      de: "Zitronensaft",
      ar: "عصير ليمون",
      tr: "Limon suyu",
      detailEn: "3 tbsp (about 1 lemon), divided",
      detailDe: "3 EL (etwa 1 Zitrone), geteilt",
      detailAr: "3 ملاعق كبيرة (حوالي ليمونة)، مقسّمة",
      detailTr: "3 yemek kaşığı (yaklaşık 1 limon), bölünmüş",
      status: "need",
    },
    {
      id: "olive-oil",
      en: "Extra-virgin olive oil",
      de: "Natives Olivenöl extra",
      ar: "زيت زيتون بكر ممتاز",
      tr: "Sızma zeytinyağı",
      detailEn: "1/3 cup (80 ml), divided",
      detailDe: "1/3 Tasse (80 ml), geteilt",
      detailAr: "ثلث كوب (80 مل)، مقسّم",
      detailTr: "1/3 su bardağı (80 ml), bölünmüş",
      status: "need",
    },
    {
      id: "allspice",
      en: "Ground allspice",
      de: "Gemahlener Piment",
      ar: "بهار حلو (بهارات مشكلة)",
      tr: "Yenibahar",
      detailEn: "1 tsp",
      detailDe: "1 TL",
      detailAr: "ملعقة صغيرة",
      detailTr: "1 tatlı kaşığı",
      status: "need",
    },
    {
      id: "salt-pepper",
      en: "Salt and black pepper",
      de: "Salz und schwarzer Pfeffer",
      ar: "ملح وفلفل أسود",
      tr: "Tuz ve karabiber",
      detailEn: "1 tsp salt + ½ tsp pepper, to taste",
      detailDe: "1 TL Salz + ½ TL Pfeffer, nach Geschmack",
      detailAr: "ملعقة صغيرة ملح + نصف ملعقة صغيرة فلفل، حسب الذوق",
      detailTr: "1 tatlı kaşığı tuz + ½ tatlı kaşığı biber, damak tadına göre",
      status: "need",
    },
  ],
  localeCopy: {
    en: {
      reason:
        "Syrian-style yalanji: meatless grape leaves rolled around a tangy rice filling with tomato, herbs, and pomegranate molasses, simmered in olive oil and lemon and served at room temperature.",
      cuisineLabel: "Syrian",
      tips: [
        "Pomegranate molasses is the signature note — balance its sweet-sour tang with the lemon rather than over-sweetening.",
        "Roll firmly but not too tight; the rice needs room to expand as it cooks.",
        "Weigh the rolls down with a plate so they stay closed while simmering.",
      ],
      storageTip:
        "Keeps in an airtight container in the fridge for up to 4 days; yalanji is traditionally eaten cold or at room temperature.",
      steps: [
        "Rinse the grape leaves and soak briefly in warm water; if using brined leaves, rinse well to remove excess salt, then trim any tough stems.",
        "Rinse the rice until the water runs clear. In a bowl combine the rice, chopped onion, diced tomato, tomato paste, parsley and mint.",
        "Stir in the pomegranate molasses, 2 tbsp of the lemon juice, half the olive oil, the allspice, and salt and black pepper. The filling should taste tangy and sweet-sour and be well seasoned.",
        "Place a grape leaf shiny-side down, set a small line of filling near the stem end, fold in the sides and roll snugly but not too tightly.",
        "Line the base of a pot with a few spare leaves. Arrange the rolls seam-side down in tight layers.",
        "Whisk the remaining olive oil, remaining 1 tbsp lemon juice, a little extra pomegranate molasses and about 1½ cups water; pour over the rolls and weigh them down with a plate.",
        "Cover and simmer gently on low for 45–50 minutes until the rice is tender and the leaves are soft. Cool in the pot, then serve at room temperature drizzled with olive oil.",
      ],
    },
    de: {
      reason:
        "Yalanji nach syrischer Art: fleischlose Weinblätter, gefüllt mit einer würzig-säuerlichen Reisfüllung mit Tomate, Kräutern und Granatapfelmelasse, in Olivenöl und Zitrone geschmort und bei Raumtemperatur serviert.",
      cuisineLabel: "Syrisch",
      tips: [
        "Granatapfelmelasse ist die typische Note — ihre süß-saure Säure mit der Zitrone ausbalancieren, statt zu süß zu werden.",
        "Fest, aber nicht zu straff rollen; der Reis braucht Platz zum Quellen.",
        "Die Röllchen mit einem Teller beschweren, damit sie beim Schmoren geschlossen bleiben.",
      ],
      storageTip:
        "Hält luftdicht verschlossen im Kühlschrank bis zu 4 Tage; Yalanji wird traditionell kalt oder bei Raumtemperatur gegessen.",
      steps: [
        "Die Weinblätter abspülen und kurz in warmem Wasser einweichen; eingelegte Blätter gut abspülen, um überschüssiges Salz zu entfernen, dann harte Stiele entfernen.",
        "Den Reis abspülen, bis das Wasser klar ist. In einer Schüssel Reis, gehackte Zwiebel, gewürfelte Tomate, Tomatenmark, Petersilie und Minze vermengen.",
        "Granatapfelmelasse, 2 EL des Zitronensafts, die Hälfte des Olivenöls, den Piment sowie Salz und schwarzen Pfeffer unterrühren. Die Füllung soll würzig, süß-säuerlich und gut gewürzt schmecken.",
        "Ein Weinblatt mit der glänzenden Seite nach unten legen, eine kleine Linie Füllung ans Stielende geben, die Seiten einschlagen und satt, aber nicht zu fest aufrollen.",
        "Den Topfboden mit einigen übrigen Blättern auslegen. Die Röllchen mit der Naht nach unten dicht schichten.",
        "Restliches Olivenöl, den restlichen 1 EL Zitronensaft, etwas zusätzliche Granatapfelmelasse und etwa 1½ Tassen Wasser verquirlen; über die Röllchen gießen und mit einem Teller beschweren.",
        "Zugedeckt bei niedriger Hitze 45–50 Minuten sanft köcheln, bis der Reis weich und die Blätter zart sind. Im Topf abkühlen lassen, dann bei Raumtemperatur mit Olivenöl beträufelt servieren.",
      ],
    },
    ar: {
      reason:
        "يالنجي على الطريقة السورية: ورق عنب بلا لحم يُلف حول حشوة أرز حامضة المذاق مع الطماطم والأعشاب ودبس الرمان، تُطهى بزيت الزيتون والليمون وتُقدَّم بحرارة الغرفة.",
      cuisineLabel: "سوري",
      tips: [
        "دبس الرمان هو النكهة المميزة — وازِن حموضته الحلوة مع الليمون بدل الإفراط في التحلية.",
        "لف اللفائف بإحكام دون شدّ زائد؛ يحتاج الأرز إلى مجال ليتمدد أثناء الطهي.",
        "اضغط اللفائف بصحن ثقيل كي تبقى مغلقة أثناء الطهي.",
      ],
      storageTip:
        "تُحفظ في وعاء محكم في الثلاجة حتى 4 أيام؛ يُؤكل اليالنجي تقليدياً بارداً أو بحرارة الغرفة.",
      steps: [
        "اغسل ورق العنب وانقعه قليلاً في ماء دافئ؛ وإن كان مخللاً فاغسله جيداً لإزالة الملح الزائد ثم أزل السيقان القاسية.",
        "اغسل الأرز حتى يصفو الماء. في وعاء اخلط الأرز مع البصل المفروم والطماطم المقطعة ومعجون الطماطم والبقدونس والنعناع.",
        "أضف دبس الرمان وملعقتين كبيرتين من عصير الليمون ونصف كمية زيت الزيتون والبهار والملح والفلفل الأسود. يجب أن تكون الحشوة حامضة حلوة ومتبّلة جيداً.",
        "ضع ورقة العنب بالجهة اللامعة للأسفل، وزّع خطاً صغيراً من الحشوة قرب طرف الساق، اطوِ الجوانب ولفّها بإحكام دون شدّ زائد.",
        "افرش قعر القدر ببعض أوراق العنب الإضافية، ثم رتّب اللفائف بحيث يكون الطي للأسفل في طبقات متلاصقة.",
        "اخفق ما تبقى من زيت الزيتون وملعقة كبيرة من عصير الليمون وقليلاً من دبس الرمان مع حوالي كوب ونصف من الماء؛ اسكبه فوق اللفائف واضغطها بصحن.",
        "غطِّ القدر واطهُ على نار هادئة 45–50 دقيقة حتى ينضج الأرز وتلين الأوراق. اتركها تبرد في القدر ثم قدّمها بحرارة الغرفة مع رشة زيت زيتون.",
      ],
    },
    tr: {
      reason:
        "Suriye usulü yalancı: etsiz asma yaprakları; domates, otlar ve nar ekşisiyle hazırlanan ekşimsi pirinç harcıyla sarılır, zeytinyağı ve limonla pişirilip oda sıcaklığında servis edilir.",
      cuisineLabel: "Suriye",
      tips: [
        "Nar ekşisi imza notadır — tatlı-ekşi tadını limonla dengeleyin, fazla tatlandırmayın.",
        "Sıkı ama çok gergin olmayacak şekilde sarın; pirincin pişerken şişmesi için yer gerekir.",
        "Sarmaların pişerken açılmaması için üzerine bir tabak koyup bastırın.",
      ],
      storageTip:
        "Hava almayan bir kapta buzdolabında 4 güne kadar durur; yalancı geleneksel olarak soğuk ya da oda sıcaklığında yenir.",
      steps: [
        "Asma yapraklarını yıkayıp ılık suda kısa süre bekletin; salamura yaprak kullanıyorsanız fazla tuzunu almak için iyice yıkayın, sert sapları kesin.",
        "Pirinci suyu berraklaşana dek yıkayın. Bir kapta pirinç, doğranmış soğan, doğranmış domates, salça, maydanoz ve naneyi karıştırın.",
        "Nar ekşisini, limon suyunun 2 yemek kaşığını, zeytinyağının yarısını, yenibaharı ve tuz ile karabiberi ekleyin. Harç ekşimsi-tatlı ve iyi baharatlanmış olmalı.",
        "Asma yaprağını parlak yüzü alta gelecek şekilde koyun, sap tarafına ince bir harç şeridi yerleştirin, kenarları katlayıp sıkıca ama fazla germeden sarın.",
        "Tencerenin tabanını birkaç yedek yaprakla kaplayın. Sarmaları birleşim yeri alta gelecek şekilde sıkışık dizin.",
        "Kalan zeytinyağı, kalan 1 yemek kaşığı limon suyu, biraz fazladan nar ekşisi ve yaklaşık 1½ su bardağı suyu çırpın; sarmaların üzerine dökün ve bir tabakla bastırın.",
        "Kapağını kapatıp kısık ateşte 45–50 dakika, pirinç yumuşayıp yapraklar incelene dek pişirin. Tencerede soğutun, sonra zeytinyağı gezdirerek oda sıcaklığında servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "Makes ~30–35 rolls · 4–6 as mezze/side (3–4 as a light main)",
    scalingNote:
      "For a larger batch, increase grape leaves, rice and the filling vegetables/herbs together. Rebalance the pomegranate molasses, lemon, olive oil and seasoning gradually to taste — do not simply multiply the seasoning, or the sweet-sour balance will tip.",
  },
  defaultRole: "side",
  canServeAsMain: true,
  photo: {
    brief:
      "Photorealistic warm natural food photography of authentic Syrian-style Yalanji: about a dozen neatly hand-rolled meatless grape-leaf (vine-leaf) rolls of realistic handmade size, arranged snugly on a shallow rustic plate. Believable deep olive-green leaf color with natural matte surface and veining, glossed with olive oil; a faint rice filling visible at one or two cut ends. A lemon wedge or two alongside. Restrained, no excessive garnish, no meat, no unrelated ingredients.",
    platingNotes:
      "Rolls arranged tightly in an overlapping pattern on a shallow plate, olive-oil sheen, one or two lemon wedges to the side. Keep the plate of rolls centered and clearly the hero; no busy garnish.",
    culturalAuthenticityNotes:
      "Syrian (Levantine) yalanji is meatless, rice-based, with a pomegranate-molasses sweet-sour balance. Distinct from meat-filled warak enab / yabra. Served cold or at room temperature with olive oil and lemon.",
    focalPointX: 50,
    focalPointY: 52,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/yalanji.jpg",
  },
};

// Arabic expansion — Batch 1 (15) + Batch 2 G1 (14) + Batch 2 G2 (14).
// Batch modules only import the type from here (erased at runtime) — no cycle.
export const GENERATED_RECIPE_LIBRARY: GeneratedRecipe[] = [
  BABA_GHANOUJ,
  YALANJI,
  ...ARAB_BATCH_1,
  ...ARAB_BATCH_2_GROUP_1,
  ...ARAB_BATCH_2_GROUP_2,
];

/**
 * Leftover tokens that mean the query is a distinct variant (e.g. Musakhan Wraps)
 * and must not fuzzy-collapse onto a shorter generic alias like "musakhan".
 */
const QUERY_VARIANT_MARKERS =
  /\b(wraps?|sandwich|sandwiches|durum|سندويش)\b/u;

function queryIsMoreSpecificVariant(query: string, alias: string): boolean {
  if (query === alias) return false;
  if (!query.includes(alias)) return false;
  const leftover = query.replace(alias, " ").replace(/\s+/g, " ").trim();
  return leftover.length > 0 && QUERY_VARIANT_MARKERS.test(leftover);
}

export function findGeneratedRecipe(dishName: string): GeneratedRecipe | null {
  const key = normalizeDishName(dishName);
  if (!key) return null;

  // Exact matchKeys win first (avoids bare "maqluba" stealing "Syrian Meat Maqluba").
  for (const recipe of GENERATED_RECIPE_LIBRARY) {
    if (recipe.matchKeys.includes(key)) return recipe;
  }

  // Fuzzy: prefer the longest matching key so specific variants beat generic aliases.
  let best: GeneratedRecipe | null = null;
  let bestScore = -1;
  for (const recipe of GENERATED_RECIPE_LIBRARY) {
    for (const alias of recipe.matchKeys) {
      if (!key.includes(alias) && !alias.includes(key)) continue;
      // "musakhan wraps" must not resolve to bare "musakhan" (Palestinian Musakhan).
      if (queryIsMoreSpecificVariant(key, alias)) continue;
      const score = alias.length;
      if (score > bestScore) {
        bestScore = score;
        best = recipe;
      }
    }
  }
  return best;
}
