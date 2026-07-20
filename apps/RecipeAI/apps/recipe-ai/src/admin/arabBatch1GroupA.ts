/**
 * Arabic catalog expansion — Batch 1, Group A (Egypt / Gulf / Iraq).
 *
 * Curated, human-authored, culturally cross-checked Recipe Studio generation
 * fixtures. NOT scraped from copyrighted sources. Every recipe here is a Studio
 * draft source only: generated results enter Recipe QA = Draft and Photo QA =
 * Pending and are never promoted to the consumer catalog automatically.
 *
 * matchKeys are written already-normalized (lowercase, single-spaced, no
 * punctuation) to match normalizeDishName output without a runtime import.
 */

import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";

const KOSHARI: GeneratedRecipe = {
  matchKeys: [
    "egyptian koshari",
    "koshari",
    "kushari",
    "koshary",
    "كشري",
    "كشري مصري",
  ],
  canonicalTitle: "Egyptian Koshari",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Egyptian",
  prepMinutes: 60,
  difficulty: "medium",
  servings: 5,
  mealTypes: ["main", "rice"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["budget", "family_friendly", "high_calorie"],
  proteinCategory: "legume",
  budgetTier: "low",
  suitability: ["everyday_host", "shareable"],
  moods: ["everyday"],
  dietaryTags: ["vegetarian_ok", "vegan_ok"],
  allergens: ["Gluten"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: [
    "rice",
    "lentils",
    "macaroni",
    "chickpeas",
    "tomato",
    "garlic",
    "vinegar",
    "cumin",
    "onion",
  ],
  pantryIngredients: [
    { canonicalId: "rice", role: "critical", tokens: ["rice"] },
    { canonicalId: "brown-lentils", role: "critical", tokens: ["lentils", "brown lentils"] },
    { canonicalId: "macaroni", role: "supporting", tokens: ["macaroni", "pasta"] },
    { canonicalId: "chickpeas", role: "supporting", tokens: ["chickpeas"] },
    { canonicalId: "tomatoes", role: "supporting", tokens: ["tomato", "passata"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
  ],
  ingredients: [
    { id: "rice", en: "Rice", de: "Reis", ar: "أرز", tr: "Pirinç", detailEn: "1 cup (200 g), rinsed", detailDe: "1 Tasse (200 g), abgespült", detailAr: "كوب واحد (200 غرام)، مغسول", detailTr: "1 su bardağı (200 g), yıkanmış", status: "need" },
    { id: "brown-lentils", en: "Brown lentils", de: "Braune Linsen", ar: "عدس بني", tr: "Kahverengi mercimek", detailEn: "3/4 cup (150 g)", detailDe: "3/4 Tasse (150 g)", detailAr: "ثلاثة أرباع كوب (150 غرام)", detailTr: "3/4 su bardağı (150 g)", status: "need" },
    { id: "macaroni", en: "Small elbow macaroni", de: "Kleine Makkaroni", ar: "معكرونة صغيرة", tr: "Küçük dirsek makarna", detailEn: "1 cup (100 g)", detailDe: "1 Tasse (100 g)", detailAr: "كوب واحد (100 غرام)", detailTr: "1 su bardağı (100 g)", status: "need" },
    { id: "chickpeas", en: "Chickpeas", de: "Kichererbsen", ar: "حمّص", tr: "Nohut", detailEn: "1 cup, cooked and drained", detailDe: "1 Tasse, gekocht und abgetropft", detailAr: "كوب واحد، مسلوق ومصفّى", detailTr: "1 su bardağı, haşlanmış ve süzülmüş", status: "need" },
    { id: "tomatoes", en: "Tomato passata", de: "Tomaten-Passata", ar: "صلصة طماطم", tr: "Domates passata", detailEn: "2 cups (or 4 grated tomatoes)", detailDe: "2 Tassen (oder 4 geriebene Tomaten)", detailAr: "كوبان (أو 4 حبات طماطم مبشورة)", detailTr: "2 su bardağı (veya 4 rendelenmiş domates)", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "4 cloves, minced", detailDe: "4 Zehen, gehackt", detailAr: "4 فصوص، مفرومة", detailTr: "4 diş, ezilmiş", status: "need" },
    { id: "vinegar", en: "White vinegar", de: "Weißer Essig", ar: "خل أبيض", tr: "Beyaz sirke", detailEn: "2 tbsp", detailDe: "2 EL", detailAr: "ملعقتان كبيرتان", detailTr: "2 yemek kaşığı", status: "need" },
    { id: "cumin", en: "Ground cumin", de: "Gemahlener Kreuzkümmel", ar: "كمون مطحون", tr: "Toz kimyon", detailEn: "1 tsp", detailDe: "1 TL", detailAr: "ملعقة صغيرة", detailTr: "1 tatlı kaşığı", status: "need" },
    { id: "chili", en: "Chili / hot sauce (shatta)", de: "Chili / scharfe Sauce (Schatta)", ar: "شطة / صلصة حارة", tr: "Acı biber / acı sos (şatta)", detailEn: "to taste, optional heat", detailDe: "nach Geschmack, optionale Schärfe", detailAr: "حسب الرغبة، حِدّة اختيارية", detailTr: "damak tadına göre, isteğe bağlı acı", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "2 large, thinly sliced (for crispy onions)", detailDe: "2 große, in dünne Scheiben (für Röstzwiebeln)", detailAr: "حبتان كبيرتان، شرائح رفيعة (للبصل المقرمش)", detailTr: "2 büyük, ince dilim (çıtır soğan için)", status: "need" },
    { id: "oil", en: "Vegetable oil", de: "Pflanzenöl", ar: "زيت نباتي", tr: "Sıvı yağ", detailEn: "for frying and cooking", detailDe: "zum Braten und Kochen", detailAr: "للقلي والطهي", detailTr: "kızartma ve pişirme için", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Egypt's beloved street-food bowl: layers of rice and lentils with macaroni and chickpeas, crowned with spiced tomato sauce, tangy garlic-vinegar and sweet crispy onions.",
      cuisineLabel: "Egyptian",
      tips: [
        "Daqqa: whisk extra garlic with the vinegar (and a little cumin) as a tangy sauce to spoon over each bowl.",
        "Fry the onions slowly to a deep golden colour for the classic sweet, crisp topping — they should crackle, not burn.",
        "Cook the rice and lentils until dry and separate so the layers stay distinct.",
      ],
      storageTip:
        "Store the components separately in the fridge for up to 3 days; keep the crispy onions in a sealed jar so they stay crunchy, and reheat the sauce before assembling.",
      steps: [
        "Cook the rice and brown lentils: simmer the lentils until almost tender, then add the rice and enough water to cook both until fluffy and dry.",
        "Boil the elbow macaroni in salted water until just tender, then drain.",
        "Make the sauce: soften the garlic in a little oil, add the cumin and a pinch of chili, then pour in the tomato passata and simmer until thickened; stir in the vinegar.",
        "Fry the sliced onion in hot oil in batches until deep golden and crisp, then drain on paper.",
        "Warm the chickpeas through in a little of the sauce or water.",
        "Layer into bowls: rice-and-lentils first, then macaroni, then chickpeas.",
        "Top with the hot tomato sauce and a generous handful of crispy onions; serve extra garlic-vinegar and chili sauce on the side.",
      ],
    },
    de: {
      reason:
        "Ägyptens beliebtes Street-Food: Schichten aus Reis und Linsen mit Makkaroni und Kichererbsen, gekrönt von würziger Tomatensauce, säuerlichem Knoblauch-Essig und süßen Röstzwiebeln.",
      cuisineLabel: "Ägyptisch",
      tips: [
        "Daqqa: zusätzlichen Knoblauch mit dem Essig (und etwas Kreuzkümmel) verrühren und als säuerliche Sauce über jede Schale geben.",
        "Die Zwiebeln langsam tief goldbraun braten — sie sollen knuspern, nicht verbrennen.",
        "Reis und Linsen trocken und körnig garen, damit die Schichten getrennt bleiben.",
      ],
      storageTip:
        "Die Komponenten getrennt bis zu 3 Tage im Kühlschrank aufbewahren; die Röstzwiebeln luftdicht lagern, damit sie knusprig bleiben, und die Sauce vor dem Anrichten erwärmen.",
      steps: [
        "Reis und braune Linsen garen: die Linsen fast weich köcheln, dann den Reis und genügend Wasser zugeben und beides locker und trocken garen.",
        "Die Makkaroni in Salzwasser bissfest kochen und abgießen.",
        "Sauce zubereiten: den Knoblauch in etwas Öl anschwitzen, Kreuzkümmel und eine Prise Chili zugeben, dann die Tomaten-Passata angießen und einkochen; den Essig unterrühren.",
        "Die Zwiebeln in heißem Öl portionsweise tief goldbraun und knusprig braten, auf Küchenpapier abtropfen lassen.",
        "Die Kichererbsen in etwas Sauce oder Wasser erwärmen.",
        "In Schalen schichten: zuerst Reis-Linsen, dann Makkaroni, dann Kichererbsen.",
        "Mit heißer Tomatensauce und einer großzügigen Handvoll Röstzwiebeln toppen; extra Knoblauch-Essig und Chilisauce dazu reichen.",
      ],
    },
    ar: {
      reason:
        "طبق الشارع المصري المحبوب: طبقات من الأرز والعدس مع المعكرونة والحمّص، تعلوها صلصة طماطم متبّلة وخلطة الثوم بالخل الحامضة والبصل المقرمش الحلو.",
      cuisineLabel: "مصري",
      tips: [
        "الدقّة: اخفقي مزيداً من الثوم مع الخل (وقليل من الكمون) كصلصة حامضة تُسكب فوق كل طبق.",
        "اقلي البصل ببطء حتى يصبح ذهبياً غامقاً — يجب أن يقرمش لا أن يحترق.",
        "اطبخي الأرز والعدس حتى يجفّا وينفصلا كي تبقى الطبقات واضحة.",
      ],
      storageTip:
        "احفظي المكوّنات منفصلة في الثلاجة حتى 3 أيام؛ احتفظي بالبصل المقرمش في وعاء محكم ليبقى مقرمشاً، وأعيدي تسخين الصلصة قبل التقديم.",
      steps: [
        "اطبخي الأرز والعدس البني: اسلقي العدس حتى يوشك أن ينضج، ثم أضيفي الأرز وكمية كافية من الماء واطبخيهما حتى يصبحا مفكّكين وجافّين.",
        "اسلقي المعكرونة في ماء مملّح حتى تنضج قليلاً ثم صفّيها.",
        "حضّري الصلصة: قلّبي الثوم بقليل من الزيت، أضيفي الكمون ورشة شطة، ثم اسكبي صلصة الطماطم واتركيها تغلي حتى تثخن؛ حرّكي الخل في النهاية.",
        "اقلي البصل في زيت ساخن على دفعات حتى يصبح ذهبياً غامقاً ومقرمشاً، ثم صفّيه على ورق.",
        "سخّني الحمّص في قليل من الصلصة أو الماء.",
        "رصّي في الأطباق: الأرز والعدس أولاً، ثم المعكرونة، ثم الحمّص.",
        "غطّي بصلصة الطماطم الساخنة وحفنة سخية من البصل المقرمش؛ قدّمي صلصة الثوم بالخل والشطة جانباً.",
      ],
    },
    tr: {
      reason:
        "Mısır'ın sevilen sokak lezzeti: pirinç ve mercimek katmanları üzerine makarna ve nohut, baharatlı domates sosu, ekşi sarımsaklı sirke ve tatlı çıtır soğanla taçlandırılır.",
      cuisineLabel: "Mısır",
      tips: [
        "Dakka: biraz fazladan sarımsağı sirke (ve az kimyon) ile çırpıp her kasenin üzerine gezdirilecek ekşi bir sos yapın.",
        "Soğanları koyu altın rengi olana dek yavaşça kızartın — yanmadan çıtırlamalı.",
        "Pirinç ve mercimeği kuru ve tane tane pişirin ki katmanlar belirgin kalsın.",
      ],
      storageTip:
        "Bileşenleri ayrı ayrı buzdolabında 3 güne kadar saklayın; çıtır soğanları kapalı bir kavanozda tutun ki gevrek kalsın, sosu servisten önce ısıtın.",
      steps: [
        "Pirinç ve kahverengi mercimeği pişirin: mercimeği neredeyse yumuşayana dek haşlayın, sonra pirinç ve yeterli suyu ekleyip ikisini tane tane ve kuru olana dek pişirin.",
        "Makarnayı tuzlu suda diri olacak şekilde haşlayıp süzün.",
        "Sosu yapın: sarımsağı biraz yağda soteleyin, kimyon ve bir tutam acı biber ekleyin, domates passatayı ekleyip koyulaşana dek pişirin; sirkeyi karıştırın.",
        "Soğanları kızgın yağda partiler halinde koyu altın rengi ve çıtır olana dek kızartıp kağıt havluda süzün.",
        "Nohutu biraz sos veya suyla ısıtın.",
        "Kaselere katman yapın: önce pirinç-mercimek, sonra makarna, sonra nohut.",
        "Sıcak domates sosu ve bolca çıtır soğanla üstünü kapatın; yanında sarımsaklı sirke ve acı sos sunun.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "Makes 4–6 hearty bowls",
    scalingNote:
      "Scale the rice, lentils, macaroni and chickpeas together for more bowls, and make the tomato sauce and crispy onions generously (they carry the flavour). Add the vinegar, garlic and chili gradually to taste rather than multiplying them, so the sauce stays balanced, not sharp.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "Rustic bowl of Egyptian koshari: rice-and-lentil base, small elbow macaroni and chickpeas, spiced tomato sauce and a generous tangle of golden crispy onions, with small side dishes of garlic-vinegar and chili sauce.",
    platingNotes:
      "Layers visible in a wide bowl, crispy onions piled on top, sauce pooling; keep the bowl centered as the hero.",
    culturalAuthenticityNotes:
      "Egyptian koshari must show all components — rice, brown lentils, macaroni, chickpeas, tomato sauce and crispy onions — not a generic rice-and-lentil dish.",
    focalPointX: 50,
    focalPointY: 55,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/koshari.jpg",
  },
};

const CHICKEN_MANDI: GeneratedRecipe = {
  matchKeys: [
    "yemeni chicken mandi",
    "chicken mandi",
    "mandi",
    "mandi chicken",
    "مندي",
    "مندي دجاج",
    "مندي دجاج يمني",
  ],
  canonicalTitle: "Yemeni Chicken Mandi",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Yemeni",
  prepMinutes: 90,
  difficulty: "medium",
  servings: 5,
  mealTypes: ["main", "rice"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "special", "high_calorie"],
  proteinCategory: "chicken",
  budgetTier: "medium",
  suitability: ["guest_friendly", "everyday_host", "shareable"],
  moods: ["special", "everyday"],
  dietaryTags: ["contains_meat"],
  allergens: [],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: [
    "chicken",
    "basmati rice",
    "onion",
    "tomato",
    "garlic",
    "cardamom",
    "cinnamon",
    "cumin",
    "turmeric",
  ],
  pantryIngredients: [
    { canonicalId: "chicken", role: "critical", tokens: ["chicken"] },
    { canonicalId: "basmati-rice", role: "critical", tokens: ["basmati", "rice"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
    { canonicalId: "tomato", role: "supporting", tokens: ["tomato"] },
    { canonicalId: "hawaij", role: "supporting", tokens: ["hawaij", "spice"] },
  ],
  ingredients: [
    { id: "chicken", en: "Chicken", de: "Hähnchen", ar: "دجاج", tr: "Tavuk", detailEn: "1 whole chicken, in quarters (or 1 kg pieces)", detailDe: "1 ganzes Hähnchen, geviertelt (oder 1 kg Teile)", detailAr: "دجاجة كاملة مقطّعة أرباعاً (أو 1 كغ قطع)", detailTr: "1 bütün tavuk, çeyreklenmiş (veya 1 kg parça)", status: "need" },
    { id: "basmati-rice", en: "Basmati rice", de: "Basmatireis", ar: "أرز بسمتي", tr: "Basmati pirinç", detailEn: "2 cups (400 g), soaked 20 min", detailDe: "2 Tassen (400 g), 20 Min. eingeweicht", detailAr: "كوبان (400 غرام)، منقوع 20 دقيقة", detailTr: "2 su bardağı (400 g), 20 dk ıslatılmış", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "1 large, chopped", detailDe: "1 große, gehackt", detailAr: "حبة كبيرة، مفرومة", detailTr: "1 büyük, doğranmış", status: "need" },
    { id: "tomato", en: "Tomato", de: "Tomate", ar: "طماطم", tr: "Domates", detailEn: "1 large, chopped", detailDe: "1 große, gehackt", detailAr: "حبة كبيرة، مقطّعة", detailTr: "1 büyük, doğranmış", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "4 cloves, crushed", detailDe: "4 Zehen, zerdrückt", detailAr: "4 فصوص، مهروسة", detailTr: "4 diş, ezilmiş", status: "need" },
    { id: "hawaij", en: "Hawaij / mandi spice mix", de: "Hawaij / Mandi-Gewürz", ar: "هوايج / بهار مندي", tr: "Havayic / mandi baharatı", detailEn: "2 tsp (cumin, coriander, black pepper base)", detailDe: "2 TL (Basis: Kreuzkümmel, Koriander, Pfeffer)", detailAr: "ملعقتان صغيرتان (كمون وكزبرة وفلفل أسود)", detailTr: "2 tatlı kaşığı (kimyon, kişniş, karabiber)", status: "need" },
    { id: "cardamom", en: "Cardamom & whole spices", de: "Kardamom & ganze Gewürze", ar: "هيل وبهارات كاملة", tr: "Kakule ve tane baharat", detailEn: "4 pods, 2 cloves, 1 bay leaf, 1 cinnamon stick", detailDe: "4 Kapseln, 2 Nelken, 1 Lorbeer, 1 Zimtstange", detailAr: "4 حبات هيل، 2 قرنفل، ورقة غار، عود قرفة", detailTr: "4 kapsül, 2 karanfil, 1 defne, 1 tarçın çubuğu", status: "need" },
    { id: "cinnamon", en: "Ground cinnamon", de: "Gemahlener Zimt", ar: "قرفة مطحونة", tr: "Toz tarçın", detailEn: "1/2 tsp", detailDe: "1/2 TL", detailAr: "نصف ملعقة صغيرة", detailTr: "1/2 tatlı kaşığı", status: "need" },
    { id: "cumin", en: "Ground cumin", de: "Gemahlener Kreuzkümmel", ar: "كمون مطحون", tr: "Toz kimyon", detailEn: "1 tsp", detailDe: "1 TL", detailAr: "ملعقة صغيرة", detailTr: "1 tatlı kaşığı", status: "need" },
    { id: "turmeric", en: "Turmeric", de: "Kurkuma", ar: "كركم", tr: "Zerdeçal", detailEn: "1/2 tsp (with a pinch of saffron, optional)", detailDe: "1/2 TL (mit einer Prise Safran, optional)", detailAr: "نصف ملعقة صغيرة (مع رشة زعفران، اختياري)", detailTr: "1/2 tatlı kaşığı (bir tutam safran, isteğe bağlı)", status: "need" },
    { id: "oil", en: "Neutral oil", de: "Neutrales Öl", ar: "زيت نباتي", tr: "Nötr yağ", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "salt", en: "Salt", de: "Salz", ar: "ملح", tr: "Tuz", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Yemeni mandi: chicken and fragrant basmati slow-cooked with warm hawaij spices, finished with a hint of smoky aroma and served on a fluffy, saffron-tinged rice platter.",
      cuisineLabel: "Yemeni",
      tips: [
        "For the traditional smoky note, briefly rest a piece of glowing natural charcoal in a small heatproof cup on the rice, drizzle with a drop of oil, cover for 2 minutes, then remove (optional).",
        "Cook the rice in the strained chicken broth for the deepest flavour.",
        "Rest the rice covered for 10 minutes before fluffing so it stays separate.",
      ],
      storageTip:
        "Keep chicken and rice in the fridge up to 3 days; reheat covered with a splash of broth or water so the rice does not dry out.",
      steps: [
        "Rub the chicken with half the hawaij, cumin, cinnamon, turmeric, garlic and salt; let it sit while you start the base.",
        "In a large pot, soften the onion and tomato in the oil with the cardamom and whole spices.",
        "Add the chicken and brown lightly, then pour in water to almost cover and simmer until tender; lift out the chicken.",
        "Measure the broth, season, add the soaked basmati rice and the rest of the spices, and cook until the rice is just done.",
        "Roast or grill the chicken pieces briefly until the skin is golden and lightly charred.",
        "Pile the rice on a platter, arrange the chicken on top, and add the optional smoky-charcoal step before serving.",
      ],
    },
    de: {
      reason:
        "Jemenitisches Mandi: Hähnchen und duftender Basmati, langsam mit warmen Hawaij-Gewürzen gegart, mit einem Hauch Rauchoma und auf lockerem, safrangelbem Reis serviert.",
      cuisineLabel: "Jemenitisch",
      tips: [
        "Für die typische Rauchnote ein Stück glühende Naturkohle in einem kleinen hitzefesten Gefäß auf den Reis setzen, mit einem Tropfen Öl beträufeln, 2 Minuten abdecken und wieder entfernen (optional).",
        "Den Reis in der abgeseihten Hähnchenbrühe garen für tiefsten Geschmack.",
        "Den Reis vor dem Auflockern 10 Minuten zugedeckt ruhen lassen.",
      ],
      storageTip:
        "Hähnchen und Reis bis zu 3 Tage im Kühlschrank aufbewahren; zugedeckt mit einem Schuss Brühe oder Wasser erwärmen, damit der Reis nicht austrocknet.",
      steps: [
        "Das Hähnchen mit der Hälfte des Hawaij, Kreuzkümmel, Zimt, Kurkuma, Knoblauch und Salz einreiben und ziehen lassen, während die Basis beginnt.",
        "In einem großen Topf Zwiebel und Tomate im Öl mit Kardamom und ganzen Gewürzen anschwitzen.",
        "Das Hähnchen zugeben und leicht anbräunen, dann fast bedeckt mit Wasser angießen und weich köcheln; das Hähnchen herausheben.",
        "Die Brühe abmessen, würzen, den eingeweichten Basmatireis und die restlichen Gewürze zugeben und den Reis knapp gar kochen.",
        "Die Hähnchenteile kurz rösten oder grillen, bis die Haut goldbraun und leicht angeröstet ist.",
        "Den Reis auf einer Platte anhäufen, das Hähnchen darauf anrichten und vor dem Servieren den optionalen Rauchkohle-Schritt durchführen.",
      ],
    },
    ar: {
      reason:
        "المندي اليمني: دجاج وأرز بسمتي عطري يُطهى ببطء مع بهارات الهوايج الدافئة، ويُنهى بلمسة دخان خفيفة ويُقدّم على صحن أرز هشّ مائل للأصفر.",
      cuisineLabel: "يمني",
      tips: [
        "للحصول على نكهة الدخان التقليدية، ضعي قطعة فحم طبيعي متوهّجة في كوب صغير مقاوم للحرارة فوق الأرز، أضيفي قطرة زيت، غطّي دقيقتين ثم ارفعيها (اختياري).",
        "اطبخي الأرز في مرق الدجاج المصفّى للحصول على أعمق نكهة.",
        "اتركي الأرز مغطّى 10 دقائق قبل تفكيكه ليبقى منفصلاً.",
      ],
      storageTip:
        "احفظي الدجاج والأرز في الثلاجة حتى 3 أيام؛ أعيدي التسخين مغطّى مع رشة مرق أو ماء كي لا يجفّ الأرز.",
      steps: [
        "افركي الدجاج بنصف الهوايج والكمون والقرفة والكركم والثوم والملح، واتركيه جانباً بينما تبدئين بالقاعدة.",
        "في قدر كبير، قلّبي البصل والطماطم في الزيت مع الهيل والبهارات الكاملة.",
        "أضيفي الدجاج وحمّريه قليلاً، ثم اسكبي الماء حتى يكاد يغطّيه واطهيه حتى يطرى؛ ارفعي الدجاج.",
        "قيسي المرق وتبّليه، أضيفي الأرز البسمتي المنقوع وباقي البهارات، واطبخيه حتى ينضج الأرز تماماً.",
        "اشوي أو حمّري قطع الدجاج قليلاً حتى يصبح الجلد ذهبياً ومحمّراً قليلاً.",
        "ضعي الأرز على صحن، رتّبي الدجاج فوقه، ونفّذي خطوة الفحم المدخّن الاختيارية قبل التقديم.",
      ],
    },
    tr: {
      reason:
        "Yemen mandısı: tavuk ve mis kokulu basmati, sıcak havayic baharatlarıyla ağır ateşte pişirilir, hafif dumanlı bir aromayla bitirilip kabarık, safran tonlu pilav tabağında sunulur.",
      cuisineLabel: "Yemen",
      tips: [
        "Geleneksel dumanlı nota için küçük ısıya dayanıklı bir kaba köz halinde doğal kömür koyup pilavın üzerine yerleştirin, bir damla yağ gezdirin, 2 dakika kapatıp çıkarın (isteğe bağlı).",
        "En derin lezzet için pirinci süzülmüş tavuk suyunda pişirin.",
        "Pirinci tanelemeden önce 10 dakika kapalı dinlendirin.",
      ],
      storageTip:
        "Tavuk ve pilavı buzdolabında 3 güne kadar saklayın; pirinç kurumasın diye biraz et suyu veya suyla kapağı kapalı ısıtın.",
      steps: [
        "Tavuğu havayicin yarısı, kimyon, tarçın, zerdeçal, sarımsak ve tuzla ovun; tabanı hazırlarken bekletin.",
        "Büyük bir tencerede soğan ve domatesi yağda kakule ve tane baharatlarla soteleyin.",
        "Tavuğu ekleyip hafif kızartın, ardından neredeyse örtene dek su ekleyip yumuşayana dek pişirin; tavuğu çıkarın.",
        "Et suyunu ölçüp tuzlayın, ıslatılmış basmati pirinci ve kalan baharatları ekleyin, pirinç tam kıvamına gelene dek pişirin.",
        "Tavuk parçalarını derisi altın rengi ve hafif kızarana dek kısaca fırınlayın veya ızgara yapın.",
        "Pilavı tabağa yığın, tavuğu üzerine dizin ve servisten önce isteğe bağlı dumanlı kömür adımını uygulayın.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "One family platter · serves 4–6",
    scalingNote:
      "Scale chicken and rice together and cook the rice in the extra broth. Increase the whole spices and hawaij only modestly and taste as you go — mandi should be warmly aromatic, not overpoweringly spiced.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A round platter of saffron-tinged Yemeni mandi rice with a golden roasted-and-smoked chicken portion on top, whole spices faintly visible.",
    platingNotes:
      "Chicken centered on a bed of fluffy yellow rice on a metal platter; keep the platter centered.",
    culturalAuthenticityNotes:
      "Yemeni mandi is defined by hawaij spicing and a smoky roasted finish — it should read distinctly from a tomato-based kabsa.",
    focalPointX: 50,
    focalPointY: 45,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/chicken-mandi.jpg",
  },
};

const LAMB_KABSA: GeneratedRecipe = {
  matchKeys: [
    "saudi lamb kabsa",
    "lamb kabsa",
    "kabsa lamb",
    "kabsat lahm",
    "كبسة لحم",
    "كبسة لحم سعودية",
    "كبسة غنم",
  ],
  canonicalTitle: "Saudi Lamb Kabsa",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Saudi",
  prepMinutes: 100,
  difficulty: "medium",
  servings: 6,
  mealTypes: ["main", "rice"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "special", "high_calorie"],
  proteinCategory: "lamb",
  budgetTier: "premium",
  suitability: ["guest_friendly", "everyday_host", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_meat"],
  allergens: [],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: [
    "lamb",
    "basmati rice",
    "onion",
    "tomato",
    "garlic",
    "dried lime",
    "cinnamon",
    "cardamom",
    "cloves",
  ],
  pantryIngredients: [
    { canonicalId: "lamb", role: "critical", tokens: ["lamb", "mutton"] },
    { canonicalId: "basmati-rice", role: "critical", tokens: ["basmati", "rice"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
    { canonicalId: "tomato", role: "supporting", tokens: ["tomato"] },
    { canonicalId: "dried-lime", role: "supporting", tokens: ["dried lime", "loomi"] },
  ],
  ingredients: [
    { id: "lamb", en: "Lamb", de: "Lamm", ar: "لحم غنم", tr: "Kuzu eti", detailEn: "1 kg bone-in pieces", detailDe: "1 kg Stücke mit Knochen", detailAr: "1 كغ قطع بالعظم", detailTr: "1 kg kemikli parça", status: "need" },
    { id: "basmati-rice", en: "Basmati rice", de: "Basmatireis", ar: "أرز بسمتي", tr: "Basmati pirinç", detailEn: "2.5 cups (500 g), soaked", detailDe: "2,5 Tassen (500 g), eingeweicht", detailAr: "كوبان ونصف (500 غرام)، منقوع", detailTr: "2,5 su bardağı (500 g), ıslatılmış", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "2 large, chopped", detailDe: "2 große, gehackt", detailAr: "حبتان كبيرتان، مفرومتان", detailTr: "2 büyük, doğranmış", status: "need" },
    { id: "tomato", en: "Tomato", de: "Tomate", ar: "طماطم", tr: "Domates", detailEn: "3, grated (or 2 tbsp tomato paste)", detailDe: "3, gerieben (oder 2 EL Tomatenmark)", detailAr: "3 حبات مبشورة (أو ملعقتان معجون طماطم)", detailTr: "3 adet rendelenmiş (veya 2 yk salça)", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "5 cloves, crushed", detailDe: "5 Zehen, zerdrückt", detailAr: "5 فصوص، مهروسة", detailTr: "5 diş, ezilmiş", status: "need" },
    { id: "dried-lime", en: "Dried lime (loomi)", de: "Getrocknete Limette (Loomi)", ar: "ليمون أسود (لومي)", tr: "Kuru limon (loomi)", detailEn: "2, pierced", detailDe: "2, eingestochen", detailAr: "حبتان، مثقوبتان", detailTr: "2 adet, delinmiş", status: "need" },
    { id: "kabsa-spice", en: "Kabsa spice (baharat)", de: "Kabsa-Gewürz (Baharat)", ar: "بهارات الكبسة", tr: "Kabsa baharatı", detailEn: "2 tsp (coriander, cumin, black pepper, nutmeg)", detailDe: "2 TL (Koriander, Kreuzkümmel, Pfeffer, Muskat)", detailAr: "ملعقتان صغيرتان (كزبرة، كمون، فلفل، جوزة الطيب)", detailTr: "2 tatlı kaşığı (kişniş, kimyon, biber, hindistan cevizi)", status: "need" },
    { id: "cinnamon", en: "Cinnamon & cloves", de: "Zimt & Nelken", ar: "قرفة وقرنفل", tr: "Tarçın ve karanfil", detailEn: "1 stick, 3 cloves", detailDe: "1 Stange, 3 Nelken", detailAr: "عود قرفة، 3 قرنفل", detailTr: "1 çubuk, 3 karanfil", status: "need" },
    { id: "cardamom", en: "Cardamom & bay", de: "Kardamom & Lorbeer", ar: "هيل وورق غار", tr: "Kakule ve defne", detailEn: "4 pods, 2 bay leaves", detailDe: "4 Kapseln, 2 Lorbeer", detailAr: "4 حبات هيل، ورقتا غار", detailTr: "4 kapsül, 2 defne", status: "need" },
    { id: "tomato-paste", en: "Tomato paste", de: "Tomatenmark", ar: "معجون طماطم", tr: "Salça", detailEn: "1 tbsp", detailDe: "1 EL", detailAr: "ملعقة كبيرة", detailTr: "1 yemek kaşığı", status: "need" },
    { id: "oil", en: "Oil", de: "Öl", ar: "زيت", tr: "Yağ", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "salt", en: "Salt", de: "Salz", ar: "ملح", tr: "Tuz", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Saudi kabsa made with lamb: bone-in meat braised with tomato, warm baharat and dried lime, then the fragrant broth is used to cook basmati into a deeply spiced festive rice.",
      cuisineLabel: "Saudi",
      tips: [
        "Pierce the dried limes so they release their sour, slightly bitter perfume into the broth.",
        "Brown the lamb well first — the fond builds the kabsa's deep colour and flavour.",
        "For a smoky finish, char the lamb briefly under a grill before serving.",
      ],
      storageTip:
        "Refrigerate up to 3 days; reheat the rice covered with a little water and warm the lamb through separately so it stays tender.",
      steps: [
        "Brown the lamb in the oil, then add the onion and garlic and cook until soft.",
        "Stir in the grated tomato, tomato paste, kabsa spice, cinnamon, cloves, cardamom, bay and dried lime.",
        "Pour in water to cover and simmer gently until the lamb is very tender; lift out the meat.",
        "Measure the broth, add the soaked basmati rice, adjust salt, and cook until the rice is fluffy.",
        "Meanwhile grill or roast the lamb pieces briefly until browned and glossy.",
        "Pile the spiced rice on a platter and arrange the lamb on top to serve.",
      ],
    },
    de: {
      reason:
        "Saudische Kabsa mit Lamm: Fleisch mit Knochen wird mit Tomate, warmem Baharat und getrockneter Limette geschmort, dann wird die duftende Brühe genutzt, um Basmati zu tief gewürztem Festreis zu garen.",
      cuisineLabel: "Saudisch",
      tips: [
        "Die getrockneten Limetten einstechen, damit sie ihr saures, leicht bitteres Aroma an die Brühe abgeben.",
        "Das Lamm zuerst gut anbräunen — der Bratensatz bildet Farbe und Tiefe der Kabsa.",
        "Für eine rauchige Note das Lamm vor dem Servieren kurz untergrillen.",
      ],
      storageTip:
        "Bis zu 3 Tage kühlen; den Reis zugedeckt mit etwas Wasser erwärmen und das Lamm separat durchwärmen, damit es zart bleibt.",
      steps: [
        "Das Lamm im Öl anbräunen, dann Zwiebel und Knoblauch zugeben und weich garen.",
        "Geriebene Tomate, Tomatenmark, Kabsa-Gewürz, Zimt, Nelken, Kardamom, Lorbeer und getrocknete Limette einrühren.",
        "Mit Wasser bedecken und sanft köcheln, bis das Lamm sehr zart ist; das Fleisch herausheben.",
        "Die Brühe abmessen, den eingeweichten Basmatireis zugeben, salzen und den Reis locker garen.",
        "Inzwischen die Lammstücke kurz grillen oder rösten, bis sie gebräunt und glänzend sind.",
        "Den gewürzten Reis auf einer Platte anhäufen und das Lamm zum Servieren darauf anrichten.",
      ],
    },
    ar: {
      reason:
        "كبسة سعودية باللحم: لحم بالعظم يُطهى مع الطماطم والبهارات الدافئة والليمون الأسود، ثم يُستخدم المرق العطري لطبخ الأرز البسمتي وتحويله إلى أرز احتفالي غنيّ بالبهار.",
      cuisineLabel: "سعودي",
      tips: [
        "اثقبي الليمون الأسود ليطلق نكهته الحامضة المائلة للمرارة في المرق.",
        "حمّري اللحم جيداً أولاً — فطبقة القاع تمنح الكبسة لونها ونكهتها العميقة.",
        "للمسة مدخّنة، اشوي اللحم قليلاً تحت الشواية قبل التقديم.",
      ],
      storageTip:
        "تُحفظ في الثلاجة حتى 3 أيام؛ أعيدي تسخين الأرز مغطّى مع قليل من الماء وسخّني اللحم منفصلاً كي يبقى طرياً.",
      steps: [
        "حمّري اللحم في الزيت، ثم أضيفي البصل والثوم واطهيهما حتى يليّنا.",
        "أضيفي الطماطم المبشورة ومعجون الطماطم وبهارات الكبسة والقرفة والقرنفل والهيل وورق الغار والليمون الأسود.",
        "اسكبي الماء حتى يغطّي المزيج واطهيه بهدوء حتى يصبح اللحم طرياً جداً؛ ارفعي اللحم.",
        "قيسي المرق، أضيفي الأرز البسمتي المنقوع، عدّلي الملح، واطبخي الأرز حتى يصبح هشّاً.",
        "في هذه الأثناء اشوي أو حمّري قطع اللحم قليلاً حتى تتحمّر وتلمع.",
        "ضعي الأرز المتبّل على صحن ورتّبي اللحم فوقه للتقديم.",
      ],
    },
    tr: {
      reason:
        "Kuzu etli Suudi kabsası: kemikli et domates, sıcak baharat ve kuru limonla pişirilir, ardından mis kokulu et suyuyla basmati pirinç derin baharatlı bayramlık bir pilava dönüşür.",
      cuisineLabel: "Suudi",
      tips: [
        "Kuru limonları delin ki ekşi, hafif acımsı aromasını et suyuna versinler.",
        "Kuzuyu önce iyice kızartın — dipte oluşan tat kabsaya derin renk ve lezzet verir.",
        "Dumanlı bir bitiş için kuzuyu servisten önce kısa süre ızgarada kızartın.",
      ],
      storageTip:
        "Buzdolabında 3 güne kadar saklayın; pilavı biraz suyla kapağı kapalı ısıtın ve kuzuyu ayrı ısıtın ki yumuşak kalsın.",
      steps: [
        "Kuzuyu yağda kızartın, sonra soğan ve sarımsağı ekleyip yumuşayana dek pişirin.",
        "Rendelenmiş domates, salça, kabsa baharatı, tarçın, karanfil, kakule, defne ve kuru limonu karıştırın.",
        "Üzerini örtene dek su ekleyip kuzu iyice yumuşayana dek hafifçe pişirin; eti çıkarın.",
        "Et suyunu ölçün, ıslatılmış basmati pirinci ekleyin, tuzu ayarlayın ve pirinç kabarana dek pişirin.",
        "Bu sırada kuzu parçalarını kızarıp parlayana dek kısaca ızgara yapın veya fırınlayın.",
        "Baharatlı pilavı tabağa yığın ve servis için kuzuyu üzerine dizin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 5,
    baseServingsMax: 6,
    servingLabel: "One large platter · serves 5–6",
    scalingNote:
      "Scale lamb and rice together and keep enough broth to cook all the rice. Add dried lime and baharat gradually — one extra dried lime and a little more spice is plenty; too much turns the kabsa bitter rather than fragrant.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A family platter of reddish-brown spiced basmati kabsa rice with tender bone-in lamb pieces on top and a dried black lime visible.",
    platingNotes:
      "Lamb arranged over a mound of spiced rice on a round platter; keep the platter centered.",
    culturalAuthenticityNotes:
      "Saudi lamb kabsa is tomato-and-baharat based with dried lime, distinct from the existing chicken kabsa; lamb must be the clear protein.",
    focalPointX: 50,
    focalPointY: 48,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/lamb-kabsa.jpg",
  },
};

const IRAQI_DOLMA: GeneratedRecipe = {
  matchKeys: [
    "iraqi dolma",
    "dolma iraqi",
    "iraqi dolma mixed",
    "dolma",
    "دولمة",
    "دولمة عراقية",
  ],
  canonicalTitle: "Iraqi Dolma",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Iraqi",
  prepMinutes: 120,
  difficulty: "medium",
  servings: 6,
  mealTypes: ["main"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "special", "high_calorie"],
  proteinCategory: "mixed",
  budgetTier: "medium",
  suitability: ["guest_friendly", "everyday_host", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_meat"],
  allergens: [],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: [
    "grape leaves",
    "rice",
    "minced lamb",
    "onion",
    "bell pepper",
    "eggplant",
    "tomato",
    "pomegranate molasses",
    "parsley",
  ],
  pantryIngredients: [
    { canonicalId: "grape-leaves", role: "critical", tokens: ["grape leaves", "vine leaves"] },
    { canonicalId: "rice", role: "critical", tokens: ["rice"] },
    { canonicalId: "minced-meat", role: "critical", tokens: ["minced lamb", "minced beef", "meat"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
    { canonicalId: "bell-pepper", role: "supporting", tokens: ["bell pepper", "pepper"] },
    { canonicalId: "eggplant", role: "supporting", tokens: ["eggplant"] },
    { canonicalId: "pomegranate-molasses", role: "supporting", tokens: ["pomegranate molasses", "pomegranate"] },
  ],
  ingredients: [
    { id: "grape-leaves", en: "Grape (vine) leaves", de: "Weinblätter", ar: "ورق عنب", tr: "Asma yaprağı", detailEn: "about 30 leaves, rinsed", detailDe: "ca. 30 Blätter, abgespült", detailAr: "حوالي 30 ورقة، مغسولة", detailTr: "yaklaşık 30 yaprak, yıkanmış", status: "need" },
    { id: "rice", en: "Short-grain rice", de: "Rundkornreis", ar: "أرز قصير الحبة", tr: "Kısa taneli pirinç", detailEn: "1.5 cups (300 g), rinsed", detailDe: "1,5 Tassen (300 g), abgespült", detailAr: "كوب ونصف (300 غرام)، مغسول", detailTr: "1,5 su bardağı (300 g), yıkanmış", status: "need" },
    { id: "minced-meat", en: "Minced lamb or beef", de: "Lamm- oder Rinderhack", ar: "لحم مفروم (غنم أو بقر)", tr: "Kıyma (kuzu veya dana)", detailEn: "300 g", detailDe: "300 g", detailAr: "300 غرام", detailTr: "300 g", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "2 large (1 for shells, 1 chopped)", detailDe: "2 große (1 für Hüllen, 1 gehackt)", detailAr: "حبتان كبيرتان (واحدة للحشو، وواحدة مفرومة)", detailTr: "2 büyük (1 kabuk için, 1 doğranmış)", status: "need" },
    { id: "bell-pepper", en: "Bell peppers", de: "Paprika", ar: "فلفل رومي", tr: "Dolmalık biber", detailEn: "2, hollowed", detailDe: "2, ausgehöhlt", detailAr: "حبتان، مفرّغتان", detailTr: "2 adet, içi boşaltılmış", status: "need" },
    { id: "eggplant", en: "Small eggplants", de: "Kleine Auberginen", ar: "باذنجان صغير", tr: "Küçük patlıcan", detailEn: "2, hollowed", detailDe: "2, ausgehöhlt", detailAr: "حبتان، مفرّغتان", detailTr: "2 adet, içi boşaltılmış", status: "need" },
    { id: "zucchini", en: "Small zucchini", de: "Kleine Zucchini", ar: "كوسا صغيرة", tr: "Küçük kabak", detailEn: "2, hollowed", detailDe: "2, ausgehöhlt", detailAr: "حبتان، مفرّغتان", detailTr: "2 adet, içi boşaltılmış", status: "need" },
    { id: "tomato", en: "Tomato", de: "Tomate", ar: "طماطم", tr: "Domates", detailEn: "2, diced + 2 tbsp paste", detailDe: "2, gewürfelt + 2 EL Mark", detailAr: "حبتان مقطّعتان + ملعقتان معجون", detailTr: "2 doğranmış + 2 yk salça", status: "need" },
    { id: "parsley", en: "Parsley", de: "Petersilie", ar: "بقدونس", tr: "Maydanoz", detailEn: "1/2 cup, chopped", detailDe: "1/2 Tasse, gehackt", detailAr: "نصف كوب، مفروم", detailTr: "1/2 su bardağı, doğranmış", status: "need" },
    { id: "pomegranate-molasses", en: "Pomegranate molasses", de: "Granatapfelmelasse", ar: "دبس رمان", tr: "Nar ekşisi", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "baharat", en: "Baharat & salt", de: "Baharat & Salz", ar: "بهارات وملح", tr: "Baharat ve tuz", detailEn: "2 tsp mixed spice, salt to taste", detailDe: "2 TL Mischgewürz, Salz nach Geschmack", detailAr: "ملعقتان صغيرتان بهارات، وملح حسب الذوق", detailTr: "2 tatlı kaşığı karışık baharat, tuz", status: "need" },
    { id: "olive-oil", en: "Olive oil", de: "Olivenöl", ar: "زيت زيتون", tr: "Zeytinyağı", detailEn: "1/3 cup", detailDe: "1/3 Tasse", detailAr: "ثلث كوب", detailTr: "1/3 su bardağı", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Iraqi dolma is a whole family of stuffed vegetables and grape leaves — peppers, eggplant, zucchini, onion and vine leaves — packed with a spiced rice-and-meat filling and simmered in a tangy tomato and pomegranate broth.",
      cuisineLabel: "Iraqi",
      tips: [
        "Layer the sturdier stuffed vegetables at the bottom of the pot and the delicate grape-leaf rolls on top.",
        "The Iraqi identity is sweet-sour: balance the pomegranate molasses with the tomato so it is tangy, not sharp.",
        "Weigh everything down with an inverted plate so the parcels stay closed while cooking.",
      ],
      storageTip:
        "Refrigerate up to 3 days; dolma tastes even better the next day and can be served warm or at room temperature.",
      steps: [
        "Make the filling: mix the rice, minced meat, chopped onion, diced tomato, parsley, baharat, half the pomegranate molasses and the olive oil.",
        "Hollow the bell peppers, eggplant and zucchini, and separate onion layers for stuffing.",
        "Fill the vegetables loosely and roll the filling in grape leaves, leaving room for the rice to expand.",
        "Line the pot base with spare leaves, then pack the stuffed vegetables in first and the grape-leaf rolls on top.",
        "Whisk the tomato paste, remaining pomegranate molasses and water, pour over, and weigh down with a plate.",
        "Cover and simmer gently for about 1 hour until the rice and vegetables are tender; rest before serving.",
      ],
    },
    de: {
      reason:
        "Irakische Dolma ist eine ganze Familie gefüllter Gemüse und Weinblätter — Paprika, Aubergine, Zucchini, Zwiebel und Weinblätter — mit einer gewürzten Reis-Fleisch-Füllung und in einer säuerlichen Tomaten-Granatapfel-Brühe geschmort.",
      cuisineLabel: "Irakisch",
      tips: [
        "Die festeren gefüllten Gemüse nach unten in den Topf schichten, die zarten Weinblattröllchen nach oben.",
        "Die irakische Note ist süß-sauer: die Granatapfelmelasse mit der Tomate ausbalancieren, damit es säuerlich, nicht scharf wird.",
        "Alles mit einem umgedrehten Teller beschweren, damit die Päckchen geschlossen bleiben.",
      ],
      storageTip:
        "Bis zu 3 Tage kühlen; Dolma schmeckt am nächsten Tag noch besser und kann warm oder bei Raumtemperatur serviert werden.",
      steps: [
        "Füllung anrühren: Reis, Hackfleisch, gehackte Zwiebel, gewürfelte Tomate, Petersilie, Baharat, die Hälfte der Granatapfelmelasse und das Olivenöl vermengen.",
        "Paprika, Aubergine und Zucchini aushöhlen und Zwiebelschichten zum Füllen lösen.",
        "Das Gemüse locker füllen und die Füllung in Weinblätter rollen, Platz zum Quellen des Reises lassen.",
        "Den Topfboden mit übrigen Blättern auslegen, zuerst das gefüllte Gemüse einschichten, die Weinblattröllchen obenauf.",
        "Tomatenmark, restliche Granatapfelmelasse und Wasser verquirlen, angießen und mit einem Teller beschweren.",
        "Zugedeckt etwa 1 Stunde sanft köcheln, bis Reis und Gemüse zart sind; vor dem Servieren ruhen lassen.",
      ],
    },
    ar: {
      reason:
        "الدولمة العراقية عائلة كاملة من الخضار وورق العنب المحشي — فلفل وباذنجان وكوسا وبصل وورق عنب — محشوّة بخلطة أرز ولحم متبّلة وتُطهى في مرق طماطم ودبس رمان حامض المذاق.",
      cuisineLabel: "عراقي",
      tips: [
        "رصّي الخضار المحشوة الأكثر صلابة في قاع القدر ولفائف ورق العنب الرقيقة في الأعلى.",
        "الهوية العراقية حلوة-حامضة: وازِني دبس الرمان مع الطماطم ليكون المذاق حامضاً لا لاذعاً.",
        "اضغطي المكوّنات بصحن مقلوب كي تبقى مغلقة أثناء الطهي.",
      ],
      storageTip:
        "تُحفظ في الثلاجة حتى 3 أيام؛ تكون الدولمة ألذّ في اليوم التالي وتُقدّم دافئة أو بحرارة الغرفة.",
      steps: [
        "حضّري الحشوة: اخلطي الأرز واللحم المفروم والبصل المفروم والطماطم المقطّعة والبقدونس والبهارات ونصف دبس الرمان وزيت الزيتون.",
        "فرّغي الفلفل والباذنجان والكوسا، وافصلي طبقات البصل للحشو.",
        "احشي الخضار بلا ضغط ولفّي الحشوة بورق العنب، مع ترك مجال لتمدّد الأرز.",
        "افرشي قعر القدر بأوراق إضافية، ثم رصّي الخضار المحشوة أولاً ولفائف ورق العنب فوقها.",
        "اخفقي معجون الطماطم وباقي دبس الرمان والماء، اسكبيه فوقها، واضغطيها بصحن.",
        "غطّي القدر واطهيه بهدوء حوالي ساعة حتى ينضج الأرز والخضار؛ اتركيه يرتاح قبل التقديم.",
      ],
    },
    tr: {
      reason:
        "Irak dolması, doldurulmuş sebzeler ve asma yapraklarından oluşan koca bir ailedir — biber, patlıcan, kabak, soğan ve asma yaprağı — baharatlı pirinç-kıyma harcıyla doldurulur ve ekşimsi domates-nar ekşisi suyunda pişirilir.",
      cuisineLabel: "Irak",
      tips: [
        "Daha sağlam doldurulmuş sebzeleri tencerenin dibine, narin asma yaprağı sarmalarını üste dizin.",
        "Irak kimliği tatlı-ekşidir: nar ekşisini domatesle dengeleyin ki ekşimsi olsun, keskin olmasın.",
        "Paketlerin açılmaması için her şeyi ters bir tabakla bastırın.",
      ],
      storageTip:
        "Buzdolabında 3 güne kadar saklayın; dolma ertesi gün daha da lezzetli olur, ılık veya oda sıcaklığında servis edilebilir.",
      steps: [
        "Harcı hazırlayın: pirinç, kıyma, doğranmış soğan, doğranmış domates, maydanoz, baharat, nar ekşisinin yarısı ve zeytinyağını karıştırın.",
        "Biber, patlıcan ve kabakların içini oyun, soğan katmanlarını sarmak için ayırın.",
        "Sebzeleri gevşekçe doldurun ve harcı asma yapraklarına sarın, pirincin şişmesi için yer bırakın.",
        "Tencerenin tabanını yedek yapraklarla kaplayın, önce doldurulmuş sebzeleri, üstüne asma yaprağı sarmalarını dizin.",
        "Salça, kalan nar ekşisi ve suyu çırpın, üzerine dökün ve bir tabakla bastırın.",
        "Kapağını kapatıp yaklaşık 1 saat, pirinç ve sebzeler yumuşayana dek hafifçe pişirin; servisten önce dinlendirin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 5,
    baseServingsMax: 8,
    servingLabel: "One full pot · serves 5–8 as a shared main",
    scalingNote:
      "Add more vegetables and grape leaves and scale the rice-and-meat filling to match. Increase the pomegranate molasses and tomato together and taste the cooking liquid — the sweet-sour balance is the dish, so adjust acidity gradually rather than multiplying it.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "An arranged platter of mixed Iraqi dolma — stuffed grape leaves, onion, bell pepper, eggplant and zucchini — glossy with a tangy tomato-pomegranate sauce, filling visible in cut pieces.",
    platingNotes:
      "Assorted stuffed vegetables arranged together on a platter; keep the whole arrangement centered.",
    culturalAuthenticityNotes:
      "Iraqi dolma is a mixed stuffed-vegetable family dish with a sweet-sour (pomegranate/tomato) identity — not a plain vegetarian grape-leaf mezze like yalanji.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/iraqi-dolma.jpg",
  },
};

const TEPSI_BAYTINIJAN: GeneratedRecipe = {
  matchKeys: [
    "iraqi tepsi baytinijan",
    "tepsi baytinijan",
    "tepsi baytinjan",
    "tepsi",
    "تبسي باذنجان",
    "تبسي باذنجان عراقي",
  ],
  canonicalTitle: "Iraqi Tepsi Baytinijan",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Iraqi",
  prepMinutes: 90,
  difficulty: "medium",
  servings: 5,
  mealTypes: ["main", "stew"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "high_calorie"],
  proteinCategory: "mixed",
  budgetTier: "medium",
  suitability: ["everyday_host", "shareable"],
  moods: ["everyday"],
  dietaryTags: ["contains_meat"],
  allergens: [],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: [
    "eggplant",
    "minced beef",
    "tomato",
    "potato",
    "onion",
    "bell pepper",
    "garlic",
    "tomato paste",
  ],
  pantryIngredients: [
    { canonicalId: "eggplant", role: "critical", tokens: ["eggplant", "aubergine"] },
    { canonicalId: "minced-meat", role: "critical", tokens: ["minced beef", "minced lamb", "meat"] },
    { canonicalId: "tomato", role: "supporting", tokens: ["tomato"] },
    { canonicalId: "potato", role: "supporting", tokens: ["potato"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
    { canonicalId: "bell-pepper", role: "supporting", tokens: ["bell pepper", "pepper"] },
  ],
  ingredients: [
    { id: "eggplant", en: "Eggplant", de: "Aubergine", ar: "باذنجان", tr: "Patlıcan", detailEn: "3 large, sliced into rounds", detailDe: "3 große, in Scheiben", detailAr: "3 حبات كبيرة، شرائح دائرية", detailTr: "3 büyük, halka dilimlenmiş", status: "need" },
    { id: "minced-meat", en: "Minced beef or lamb", de: "Rinder- oder Lammhack", ar: "لحم مفروم (بقر أو غنم)", tr: "Dana veya kuzu kıyma", detailEn: "400 g", detailDe: "400 g", detailAr: "400 غرام", detailTr: "400 g", status: "need" },
    { id: "potato", en: "Potatoes", de: "Kartoffeln", ar: "بطاطا", tr: "Patates", detailEn: "2, sliced into rounds", detailDe: "2, in Scheiben", detailAr: "حبتان، شرائح دائرية", detailTr: "2 adet, halka dilimlenmiş", status: "need" },
    { id: "tomato", en: "Tomatoes", de: "Tomaten", ar: "طماطم", tr: "Domates", detailEn: "3, sliced into rounds", detailDe: "3, in Scheiben", detailAr: "3 حبات، شرائح دائرية", detailTr: "3 adet, halka dilimlenmiş", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "1 large, chopped", detailDe: "1 große, gehackt", detailAr: "حبة كبيرة، مفرومة", detailTr: "1 büyük, doğranmış", status: "need" },
    { id: "bell-pepper", en: "Bell pepper", de: "Paprika", ar: "فلفل رومي", tr: "Biber", detailEn: "1, sliced", detailDe: "1, in Streifen", detailAr: "حبة واحدة، شرائح", detailTr: "1 adet, dilimlenmiş", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "3 cloves, minced", detailDe: "3 Zehen, gehackt", detailAr: "3 فصوص، مفرومة", detailTr: "3 diş, ezilmiş", status: "need" },
    { id: "tomato-paste", en: "Tomato paste", de: "Tomatenmark", ar: "معجون طماطم", tr: "Salça", detailEn: "2 tbsp, in 1.5 cups water", detailDe: "2 EL, in 1,5 Tassen Wasser", detailAr: "ملعقتان كبيرتان في كوب ونصف ماء", detailTr: "2 yk, 1,5 su bardağı suda", status: "need" },
    { id: "baharat", en: "Baharat", de: "Baharat", ar: "بهارات", tr: "Baharat", detailEn: "1.5 tsp mixed spice", detailDe: "1,5 TL Mischgewürz", detailAr: "ملعقة ونصف بهارات", detailTr: "1,5 tatlı kaşığı karışık baharat", status: "need" },
    { id: "oil", en: "Oil", de: "Öl", ar: "زيت", tr: "Yağ", detailEn: "for frying", detailDe: "zum Braten", detailAr: "للقلي", detailTr: "kızartmak için", status: "need" },
    { id: "salt", en: "Salt & pepper", de: "Salz & Pfeffer", ar: "ملح وفلفل", tr: "Tuz ve biber", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Tepsi baytinijan is Iraq's baked eggplant tray: fried eggplant layered with spiced meatballs, tomato, potato and pepper in a light tomato sauce, then baked until everything melds.",
      cuisineLabel: "Iraqi",
      tips: [
        "Salt the eggplant slices and pat dry before frying so they brown without soaking up too much oil.",
        "Shape the meatballs small and flat so they cook through in the tray.",
        "Arrange the slices upright and overlapping for the classic tepsi look.",
      ],
      storageTip:
        "Refrigerate up to 3 days; reheat covered in the oven so the sauce stays moist. It is traditionally served with plain rice.",
      steps: [
        "Season the minced meat with baharat, half the garlic and salt, then shape into small flat meatballs and brown them.",
        "Fry the eggplant and potato rounds until golden, then drain on paper.",
        "Soften the onion, remaining garlic and bell pepper in a little oil.",
        "In a baking tray, arrange the eggplant, potato, tomato, meatballs and pepper in overlapping layers.",
        "Pour the tomato-paste-and-water sauce over, season, and cover with foil.",
        "Bake at 190°C until bubbling and tender, uncovering near the end to brown the top.",
      ],
    },
    de: {
      reason:
        "Tepsi Baytinijan ist die irakische Auberginen-Ofenform: gebratene Auberginen mit gewürzten Frikadellen, Tomate, Kartoffel und Paprika in leichter Tomatensauce geschichtet und im Ofen gebacken.",
      cuisineLabel: "Irakisch",
      tips: [
        "Die Auberginenscheiben salzen und trocken tupfen, damit sie bräunen, ohne zu viel Öl aufzusaugen.",
        "Die Frikadellen klein und flach formen, damit sie im Blech durchgaren.",
        "Die Scheiben aufrecht und überlappend anordnen für den typischen Tepsi-Look.",
      ],
      storageTip:
        "Bis zu 3 Tage kühlen; zugedeckt im Ofen erwärmen, damit die Sauce saftig bleibt. Traditionell mit einfachem Reis serviert.",
      steps: [
        "Das Hackfleisch mit Baharat, der Hälfte des Knoblauchs und Salz würzen, zu kleinen flachen Frikadellen formen und anbraten.",
        "Auberginen- und Kartoffelscheiben goldbraun braten, auf Küchenpapier abtropfen lassen.",
        "Zwiebel, restlichen Knoblauch und Paprika in etwas Öl anschwitzen.",
        "In einer Auflaufform Auberginen, Kartoffel, Tomate, Frikadellen und Paprika überlappend schichten.",
        "Die Sauce aus Tomatenmark und Wasser darüber gießen, würzen und mit Folie abdecken.",
        "Bei 190 °C backen, bis alles blubbert und zart ist, gegen Ende abdecken, um die Oberfläche zu bräunen.",
      ],
    },
    ar: {
      reason:
        "التبسي بالباذنجان هو صينية الباذنجان العراقية المشوية: باذنجان مقلي يُرصّ مع كرات لحم متبّلة وطماطم وبطاطا وفلفل في صلصة طماطم خفيفة، ثم يُخبز حتى تتجانس النكهات.",
      cuisineLabel: "عراقي",
      tips: [
        "ملّحي شرائح الباذنجان وجفّفيها قبل القلي كي تتحمّر دون أن تمتصّ زيتاً كثيراً.",
        "شكّلي كرات اللحم صغيرة ومسطّحة كي تنضج داخل الصينية.",
        "رتّبي الشرائح واقفة ومتداخلة للحصول على شكل التبسي التقليدي.",
      ],
      storageTip:
        "تُحفظ في الثلاجة حتى 3 أيام؛ أعيدي التسخين مغطّاة في الفرن كي تبقى الصلصة رطبة. تُقدّم تقليدياً مع أرز أبيض.",
      steps: [
        "تبّلي اللحم المفروم بالبهارات ونصف الثوم والملح، ثم شكّليه كرات صغيرة مسطّحة وحمّريها.",
        "اقلي شرائح الباذنجان والبطاطا حتى تذهبّ، ثم صفّيها على ورق.",
        "قلّبي البصل وباقي الثوم والفلفل الرومي في قليل من الزيت.",
        "في صينية فرن، رتّبي الباذنجان والبطاطا والطماطم وكرات اللحم والفلفل في طبقات متداخلة.",
        "اسكبي صلصة معجون الطماطم والماء فوقها، تبّليها، وغطّيها بورق ألمنيوم.",
        "اخبزيها على 190 درجة حتى تغلي وتنضج، مع كشف الغطاء قرب النهاية لتحمير الوجه.",
      ],
    },
    tr: {
      reason:
        "Tepsi baytinijan, Irak'ın fırında patlıcan tepsisidir: kızarmış patlıcan, baharatlı köfteler, domates, patates ve biberle hafif domates sosunda katmanlanır, sonra her şey bütünleşene dek fırınlanır.",
      cuisineLabel: "Irak",
      tips: [
        "Patlıcan dilimlerini tuzlayıp kurulayın ki çok yağ çekmeden kızarsınlar.",
        "Köfteleri küçük ve yassı yapın ki tepside iyice pişsinler.",
        "Klasik tepsi görünümü için dilimleri dik ve üst üste dizin.",
      ],
      storageTip:
        "Buzdolabında 3 güne kadar saklayın; sos nemli kalsın diye fırında kapağı kapalı ısıtın. Geleneksel olarak sade pilavla servis edilir.",
      steps: [
        "Kıymayı baharat, sarımsağın yarısı ve tuzla yoğurun, küçük yassı köfteler yapıp kızartın.",
        "Patlıcan ve patates halkalarını altın rengi olana dek kızartıp kağıtta süzün.",
        "Soğan, kalan sarımsak ve biberi biraz yağda soteleyin.",
        "Fırın tepsisine patlıcan, patates, domates, köfte ve biberi üst üste gelecek şekilde dizin.",
        "Salça-su sosunu üzerine dökün, tuzlayın ve folyoyla kapatın.",
        "190°C'de fokurdayıp yumuşayana dek pişirin, sona doğru üstünü açıp kızartın.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "One baking tray · serves 4–6 with rice",
    scalingNote:
      "Use a larger tray and scale the eggplant, meatballs and vegetables together. Keep enough tomato sauce to just cover the layers; add baharat gradually so the tray tastes savoury and balanced rather than over-spiced.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A baked round tray of Iraqi tepsi baytinijan: overlapping fried eggplant slices with small meatballs, tomato, potato and bell pepper in a red tomato sauce, edges lightly browned.",
    platingNotes:
      "Overlapping slices arranged in a round tray; keep the tray centered as the hero.",
    culturalAuthenticityNotes:
      "Iraqi tepsi baytinijan is a baked eggplant-and-meatball tray in tomato sauce — distinct from a plain casserole or moussaka.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/tepsi-baytinijan.jpg",
  },
};

export const ARAB_BATCH_1_GROUP_A: GeneratedRecipe[] = [
  KOSHARI,
  CHICKEN_MANDI,
  LAMB_KABSA,
  IRAQI_DOLMA,
  TEPSI_BAYTINIJAN,
];
