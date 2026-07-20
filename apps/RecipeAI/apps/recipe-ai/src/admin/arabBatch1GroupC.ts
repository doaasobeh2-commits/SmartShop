/**
 * Arabic catalog expansion — Batch 1, Group C (Levantine / Palestinian / Jordanian mains).
 *
 * Curated, human-authored Recipe Studio generation fixtures. Studio drafts only:
 * generated results enter Recipe QA = Draft and Photo QA = Pending and are never
 * promoted to the consumer catalog automatically.
 */

import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";

const CHICKEN_SHAWARMA: GeneratedRecipe = {
  matchKeys: [
    "levantine chicken shawarma",
    "chicken shawarma",
    "shawarma dajaj",
    "shawarma chicken",
    "شاورما دجاج",
    "شاورما دجاج شامية",
  ],
  canonicalTitle: "Levantine Chicken Shawarma",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 60,
  difficulty: "medium",
  servings: 4,
  mealTypes: ["main"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "budget"],
  proteinCategory: "chicken",
  budgetTier: "low",
  suitability: ["everyday_host", "shareable"],
  moods: ["everyday"],
  dietaryTags: ["contains_meat", "contains_dairy"],
  allergens: ["Dairy", "Gluten", "Sesame"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["chicken", "yogurt", "garlic", "lemon", "cumin", "flatbread", "tahini"],
  pantryIngredients: [
    { canonicalId: "chicken", role: "critical", tokens: ["chicken"] },
    { canonicalId: "yogurt", role: "supporting", tokens: ["yogurt"] },
    { canonicalId: "garlic", role: "supporting", tokens: ["garlic"] },
    { canonicalId: "flatbread", role: "supporting", tokens: ["flatbread", "bread"] },
    { canonicalId: "tahini-sauce", role: "supporting", tokens: ["tahini", "garlic sauce"] },
  ],
  ingredients: [
    { id: "chicken", en: "Chicken thighs", de: "Hähnchenschenkel", ar: "أفخاذ دجاج", tr: "Tavuk but", detailEn: "800 g boneless, skinless", detailDe: "800 g ohne Knochen und Haut", detailAr: "800 غرام مخلّي بلا جلد", detailTr: "800 g kemiksiz, derisiz", status: "need" },
    { id: "yogurt", en: "Plain yogurt", de: "Naturjoghurt", ar: "لبن زبادي", tr: "Sade yoğurt", detailEn: "1/2 cup", detailDe: "1/2 Tasse", detailAr: "نصف كوب", detailTr: "1/2 su bardağı", status: "need" },
    { id: "lemon", en: "Lemon juice", de: "Zitronensaft", ar: "عصير ليمون", tr: "Limon suyu", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "5 cloves, crushed", detailDe: "5 Zehen, zerdrückt", detailAr: "5 فصوص، مهروسة", detailTr: "5 diş, ezilmiş", status: "need" },
    { id: "vinegar", en: "White vinegar", de: "Weißer Essig", ar: "خل أبيض", tr: "Beyaz sirke", detailEn: "1 tbsp", detailDe: "1 EL", detailAr: "ملعقة كبيرة", detailTr: "1 yemek kaşığı", status: "need" },
    { id: "shawarma-spice", en: "Shawarma spice", de: "Shawarma-Gewürz", ar: "بهار شاورما", tr: "Şavarma baharatı", detailEn: "2 tbsp (allspice, cumin, coriander, cinnamon, cardamom, paprika, pepper)", detailDe: "2 EL (Piment, Kreuzkümmel, Koriander, Zimt, Kardamom, Paprika, Pfeffer)", detailAr: "ملعقتان كبيرتان (بهار، كمون، كزبرة، قرفة، هيل، بابريكا، فلفل)", detailTr: "2 yk (yenibahar, kimyon, kişniş, tarçın, kakule, toz biber, karabiber)", status: "need" },
    { id: "cumin", en: "Ground cumin", de: "Gemahlener Kreuzkümmel", ar: "كمون مطحون", tr: "Toz kimyon", detailEn: "1 tsp (extra)", detailDe: "1 TL (extra)", detailAr: "ملعقة صغيرة (إضافية)", detailTr: "1 tatlı kaşığı (ekstra)", status: "need" },
    { id: "olive-oil", en: "Olive oil", de: "Olivenöl", ar: "زيت زيتون", tr: "Zeytinyağı", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "flatbread", en: "Flatbread", de: "Fladenbrot", ar: "خبز عربي", tr: "Yassı ekmek", detailEn: "to serve", detailDe: "zum Servieren", detailAr: "للتقديم", detailTr: "servis için", status: "need" },
    { id: "tahini-sauce", en: "Tahini or garlic sauce", de: "Tahin- oder Knoblauchsauce", ar: "صلصة طحينة أو ثوم", tr: "Tahin veya sarımsak sosu", detailEn: "to serve", detailDe: "zum Servieren", detailAr: "للتقديم", detailTr: "servis için", status: "need" },
    { id: "pickles", en: "Pickles & tomato", de: "Essiggurken & Tomate", ar: "مخللات وطماطم", tr: "Turşu ve domates", detailEn: "to serve", detailDe: "zum Servieren", detailAr: "للتقديم", detailTr: "servis için", status: "need" },
    { id: "salt", en: "Salt", de: "Salz", ar: "ملح", tr: "Tuz", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "A home-cookable Levantine chicken shawarma: thighs marinated in yogurt, lemon, garlic and warm shawarma spices, then roasted and crisped in a skillet or oven — no rotisserie needed — sliced and served with garlic-tahini sauce, pickles and flatbread.",
      cuisineLabel: "Syrian",
      tips: [
        "No vertical spit required at home: a hot skillet or the oven grill gives the same browned, spiced edges.",
        "Marinate overnight for the deepest flavour and juiciest chicken.",
        "Cook over high heat and avoid crowding the pan so the chicken browns instead of steaming.",
      ],
      storageTip:
        "Refrigerate cooked chicken up to 3 days; reheat quickly in a hot pan to keep the edges crisp. Marinated raw chicken keeps 1 day before cooking.",
      steps: [
        "Make the marinade: whisk the yogurt, lemon juice, crushed garlic, vinegar, shawarma spice, cumin, olive oil and salt.",
        "Coat the chicken thighs in the marinade and chill at least 2 hours, ideally overnight.",
        "Cook the chicken in a hot skillet or under the oven grill, in batches, until browned and cooked through.",
        "Rest briefly, then slice the chicken into thin strips.",
        "Make the garlic-tahini sauce and warm the flatbread.",
        "Pile the sliced chicken with its juices onto a platter and serve with the sauce, pickles, tomato and flatbread to wrap.",
      ],
    },
    de: {
      reason:
        "Ein hausgemachtes levantinisches Hähnchen-Shawarma: Schenkel in Joghurt, Zitrone, Knoblauch und warmen Shawarma-Gewürzen mariniert, dann in Pfanne oder Ofen gebräunt und knusprig gegart — ganz ohne Drehspieß — in Scheiben mit Knoblauch-Tahin-Sauce, Essiggurken und Fladenbrot serviert.",
      cuisineLabel: "Syrisch",
      tips: [
        "Kein Drehspieß nötig: eine heiße Pfanne oder der Ofengrill liefert dieselben gebräunten, würzigen Kanten.",
        "Über Nacht marinieren für tiefsten Geschmack und saftigstes Hähnchen.",
        "Bei starker Hitze garen und die Pfanne nicht überfüllen, damit das Hähnchen bräunt statt dämpft.",
      ],
      storageTip:
        "Gegartes Hähnchen bis zu 3 Tage kühlen; in heißer Pfanne kurz erwärmen, damit die Kanten knusprig bleiben. Mariniertes rohes Hähnchen hält 1 Tag bis zum Garen.",
      steps: [
        "Marinade anrühren: Joghurt, Zitronensaft, zerdrückten Knoblauch, Essig, Shawarma-Gewürz, Kreuzkümmel, Olivenöl und Salz verquirlen.",
        "Die Hähnchenschenkel in der Marinade wenden und mindestens 2 Stunden, idealerweise über Nacht, kühlen.",
        "Das Hähnchen in heißer Pfanne oder unter dem Ofengrill portionsweise gebräunt und gar braten.",
        "Kurz ruhen lassen, dann in dünne Streifen schneiden.",
        "Die Knoblauch-Tahin-Sauce zubereiten und das Fladenbrot erwärmen.",
        "Das geschnittene Hähnchen mit dem Bratensaft auf einer Platte anrichten und mit Sauce, Essiggurken, Tomate und Fladenbrot zum Wickeln servieren.",
      ],
    },
    ar: {
      reason:
        "شاورما دجاج شامية يمكن تحضيرها في البيت: أفخاذ تُتبّل باللبن والليمون والثوم وبهارات الشاورما الدافئة، ثم تُحمّر وتُقرمش في مقلاة أو فرن — دون حاجة إلى سيخ دوّار — وتُقطّع وتُقدّم مع صلصة الثوم والطحينة والمخللات والخبز.",
      cuisineLabel: "سوري",
      tips: [
        "لا حاجة لسيخ دوّار في البيت: مقلاة ساخنة أو شواية الفرن تمنح الأطراف نفسها المحمّرة والمتبّلة.",
        "تبّلي طوال الليل للحصول على أعمق نكهة وأكثر دجاج طراوة.",
        "اطبخي على نار عالية دون ازدحام المقلاة كي يتحمّر الدجاج لا أن يُطهى بالبخار.",
      ],
      storageTip:
        "يُحفظ الدجاج المطهو حتى 3 أيام في الثلاجة؛ سخّنيه سريعاً في مقلاة ساخنة لإبقاء الأطراف مقرمشة. أما الدجاج النيء المتبّل فيُحفظ يوماً واحداً قبل الطهي.",
      steps: [
        "حضّري التتبيلة: اخفقي اللبن وعصير الليمون والثوم المهروس والخل وبهار الشاورما والكمون وزيت الزيتون والملح.",
        "غلّفي أفخاذ الدجاج بالتتبيلة وبرّديها ساعتين على الأقل، ويفضّل طوال الليل.",
        "اطبخي الدجاج في مقلاة ساخنة أو تحت شواية الفرن على دفعات حتى يتحمّر وينضج.",
        "اتركيه يرتاح قليلاً ثم قطّعيه شرائح رفيعة.",
        "حضّري صلصة الثوم والطحينة وسخّني الخبز.",
        "ضعي الدجاج المقطّع مع عصارته على صحن وقدّميه مع الصلصة والمخللات والطماطم والخبز للفّ.",
      ],
    },
    tr: {
      reason:
        "Evde yapılabilen bir Levanten tavuk şavarması: butlar yoğurt, limon, sarımsak ve sıcak şavarma baharatlarında marine edilir, sonra tavada veya fırında kızartılıp çıtırlaştırılır — döner şişe gerek yok — dilimlenip sarımsak-tahin sosu, turşu ve yassı ekmekle sunulur.",
      cuisineLabel: "Suriye",
      tips: [
        "Evde döner şiş gerekmez: kızgın tava veya fırın ızgarası aynı kızarmış, baharatlı kenarları verir.",
        "En derin lezzet ve en sulu tavuk için bir gece marine edin.",
        "Yüksek ateşte pişirin ve tavayı doldurmayın ki tavuk buğulanmadan kızarsın.",
      ],
      storageTip:
        "Pişmiş tavuğu buzdolabında 3 güne kadar saklayın; kenarları çıtır kalsın diye kızgın tavada hızlıca ısıtın. Marine edilmiş çiğ tavuk pişirmeden önce 1 gün dayanır.",
      steps: [
        "Marine sosunu hazırlayın: yoğurt, limon suyu, ezilmiş sarımsak, sirke, şavarma baharatı, kimyon, zeytinyağı ve tuzu çırpın.",
        "Tavuk butlarını marine sosuyla kaplayıp en az 2 saat, tercihen bir gece buzdolabında bekletin.",
        "Tavuğu kızgın tavada veya fırın ızgarasında partiler halinde kızarıp pişene dek pişirin.",
        "Kısa süre dinlendirip ince şeritler halinde dilimleyin.",
        "Sarımsak-tahin sosunu hazırlayın ve yassı ekmeği ısıtın.",
        "Dilimlenmiş tavuğu suyuyla tabağa yığın ve sos, turşu, domates ve dürüm için yassı ekmekle servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 3,
    baseServingsMax: 4,
    servingLabel: "Serves 3–4 with flatbread",
    scalingNote:
      "Scale the chicken and marinade together and keep the spice-to-yogurt ratio the same, adding salt and lemon to taste rather than multiplying. Cook in batches at high heat so the chicken browns instead of steaming.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A home-style plate of sliced spiced roasted chicken shawarma strips with a bowl of garlic-tahini sauce, pickles, tomato and warm flatbread — no commercial rotisserie.",
    platingNotes:
      "Sliced chicken piled centre-plate with sauce and accompaniments around it; keep the plate centered.",
    culturalAuthenticityNotes:
      "Home shawarma must look skillet/oven-cooked, not from a vertical spit; warm spice tones and garlic-tahini sauce signal the Levantine style.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/chicken-shawarma.jpg",
  },
};

const SAYADIYEH: GeneratedRecipe = {
  matchKeys: [
    "lebanese sayadiyeh",
    "sayadiyeh",
    "sayadieh",
    "fish sayadiyeh",
    "صيادية",
    "صيادية سمك",
  ],
  canonicalTitle: "Lebanese Sayadiyeh",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Lebanese (Levantine)",
  prepMinutes: 70,
  difficulty: "medium",
  servings: 4,
  mealTypes: ["main", "rice"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "special"],
  proteinCategory: "fish",
  budgetTier: "medium",
  suitability: ["guest_friendly", "everyday_host", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_fish"],
  allergens: ["Fish", "Nuts"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["white fish", "rice", "onion", "cumin", "cinnamon", "pine nuts", "lemon"],
  pantryIngredients: [
    { canonicalId: "fish", role: "critical", tokens: ["fish", "white fish"] },
    { canonicalId: "rice", role: "critical", tokens: ["rice"] },
    { canonicalId: "onion", role: "critical", tokens: ["onion"] },
    { canonicalId: "pine-nuts", role: "garnish", tokens: ["pine nuts"] },
    { canonicalId: "lemon", role: "supporting", tokens: ["lemon"] },
  ],
  ingredients: [
    { id: "fish", en: "White fish fillets", de: "Weißfischfilets", ar: "فيليه سمك أبيض", tr: "Beyaz balık fileto", detailEn: "600 g (cod, sea bass or similar)", detailDe: "600 g (Kabeljau, Wolfsbarsch o. Ä.)", detailAr: "600 غرام (قدّ أو قاروص أو ما شابه)", detailTr: "600 g (morina, levrek vb.)", status: "need" },
    { id: "rice", en: "Rice", de: "Reis", ar: "أرز", tr: "Pirinç", detailEn: "2 cups (400 g)", detailDe: "2 Tassen (400 g)", detailAr: "كوبان (400 غرام)", detailTr: "2 su bardağı (400 g)", status: "need" },
    { id: "onion", en: "Onions", de: "Zwiebeln", ar: "بصل", tr: "Soğan", detailEn: "3 large, thinly sliced", detailDe: "3 große, in dünne Scheiben", detailAr: "3 حبات كبيرة، شرائح رفيعة", detailTr: "3 büyük, ince dilimlenmiş", status: "need" },
    { id: "cumin", en: "Ground cumin", de: "Gemahlener Kreuzkümmel", ar: "كمون مطحون", tr: "Toz kimyon", detailEn: "1.5 tsp", detailDe: "1,5 TL", detailAr: "ملعقة ونصف صغيرة", detailTr: "1,5 tatlı kaşığı", status: "need" },
    { id: "cinnamon", en: "Cinnamon & allspice", de: "Zimt & Piment", ar: "قرفة وبهار حلو", tr: "Tarçın ve yenibahar", detailEn: "1/2 tsp each", detailDe: "je 1/2 TL", detailAr: "نصف ملعقة صغيرة من كلٍّ", detailTr: "her birinden 1/2 tatlı kaşığı", status: "need" },
    { id: "pine-nuts", en: "Pine nuts", de: "Pinienkerne", ar: "صنوبر", tr: "Çam fıstığı", detailEn: "1/4 cup, toasted", detailDe: "1/4 Tasse, geröstet", detailAr: "ربع كوب، محمّص", detailTr: "1/4 su bardağı, kavrulmuş", status: "need" },
    { id: "lemon", en: "Lemon", de: "Zitrone", ar: "ليمون", tr: "Limon", detailEn: "1, juiced + wedges to serve", detailDe: "1, ausgepresst + Spalten zum Servieren", detailAr: "ليمونة، عصيرها + شرائح للتقديم", detailTr: "1, suyu + servis için dilimler", status: "need" },
    { id: "olive-oil", en: "Olive oil", de: "Olivenöl", ar: "زيت زيتون", tr: "Zeytinyağı", detailEn: "1/4 cup", detailDe: "1/4 Tasse", detailAr: "ربع كوب", detailTr: "1/4 su bardağı", status: "need" },
    { id: "salt", en: "Salt & pepper", de: "Salz & Pfeffer", ar: "ملح وفلفل", tr: "Tuz ve biber", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Lebanese sayadiyeh: white fish served over deeply caramelized-onion spiced rice, the slow-browned onions giving the dish its signature colour and savoury-sweet depth, finished with toasted pine nuts and lemon.",
      cuisineLabel: "Lebanese",
      tips: [
        "Brown the onions patiently — their deep colour is what makes sayadiyeh rice brown and richly flavoured.",
        "Cook the rice in fish stock (or the onion water) for the fullest flavour.",
        "Sear the fish separately so it stays golden and does not break into the rice.",
      ],
      storageTip:
        "Refrigerate up to 2 days; reheat the rice covered and warm the fish gently so it stays moist.",
      steps: [
        "Season the fish with salt, pepper, a little cumin and lemon, and set aside.",
        "Caramelize the onions slowly in the olive oil until deeply browned; reserve some for garnish.",
        "Stir the cumin, cinnamon and allspice into the onions, then add the rice and toast briefly.",
        "Pour in hot water or fish stock, season, and cook the rice until fluffy and richly browned.",
        "Pan-sear the fish fillets until golden and just cooked through.",
        "Pile the onion rice on a platter, top with the fish, and finish with toasted pine nuts, the reserved onions and lemon wedges.",
      ],
    },
    de: {
      reason:
        "Libanesische Sayadiyeh: Weißfisch auf tief karamellisiertem Zwiebelreis, dessen langsam gebräunte Zwiebeln der Speise ihre charakteristische Farbe und würzig-süße Tiefe geben, vollendet mit gerösteten Pinienkernen und Zitrone.",
      cuisineLabel: "Libanesisch",
      tips: [
        "Die Zwiebeln geduldig bräunen — ihre tiefe Farbe macht den Sayadiyeh-Reis braun und aromatisch.",
        "Den Reis in Fischfond (oder dem Zwiebelwasser) garen für vollsten Geschmack.",
        "Den Fisch separat anbraten, damit er goldbraun bleibt und nicht im Reis zerfällt.",
      ],
      storageTip:
        "Bis zu 2 Tage kühlen; den Reis zugedeckt erwärmen und den Fisch sanft durchwärmen, damit er saftig bleibt.",
      steps: [
        "Den Fisch mit Salz, Pfeffer, etwas Kreuzkümmel und Zitrone würzen und beiseitestellen.",
        "Die Zwiebeln im Olivenöl langsam tief bräunen; einen Teil zum Garnieren zurückbehalten.",
        "Kreuzkümmel, Zimt und Piment unter die Zwiebeln rühren, dann den Reis zugeben und kurz rösten.",
        "Heißes Wasser oder Fischfond angießen, würzen und den Reis locker und tiefbraun garen.",
        "Die Fischfilets separat goldbraun und gerade gar anbraten.",
        "Den Zwiebelreis auf einer Platte anhäufen, den Fisch daraufsetzen und mit gerösteten Pinienkernen, den zurückbehaltenen Zwiebeln und Zitronenspalten vollenden.",
      ],
    },
    ar: {
      reason:
        "صيادية لبنانية: سمك أبيض يُقدّم فوق أرز متبّل ببصل مكرمل غامق، فالبصل المحمّر ببطء يمنح الطبق لونه المميّز وعمقه المالح-الحلو، ويُزيَّن بالصنوبر المحمّص والليمون.",
      cuisineLabel: "لبناني",
      tips: [
        "حمّري البصل بصبر — فلونه الغامق هو ما يمنح أرز الصيادية لونه ونكهته الغنية.",
        "اطبخي الأرز في مرق السمك (أو ماء البصل) للحصول على أكمل نكهة.",
        "اقلي السمك منفصلاً كي يبقى ذهبياً ولا يتفتّت في الأرز.",
      ],
      storageTip:
        "تُحفظ في الثلاجة حتى يومين؛ أعيدي تسخين الأرز مغطّى وسخّني السمك بهدوء كي يبقى طرياً.",
      steps: [
        "تبّلي السمك بالملح والفلفل وقليل من الكمون والليمون، واتركيه جانباً.",
        "كرملي البصل ببطء في زيت الزيتون حتى يصبح غامقاً؛ احتفظي ببعضه للتزيين.",
        "أضيفي الكمون والقرفة والبهار إلى البصل، ثم أضيفي الأرز وحمّصيه قليلاً.",
        "اسكبي ماءً ساخناً أو مرق سمك، تبّليه، واطبخي الأرز حتى يصبح هشّاً وغامق اللون.",
        "اقلي فيليه السمك منفصلاً حتى يصبح ذهبياً وينضج تماماً.",
        "ضعي أرز البصل على صحن، ضعي السمك فوقه، وأنهي بالصنوبر المحمّص والبصل المحفوظ وشرائح الليمون.",
      ],
    },
    tr: {
      reason:
        "Lübnan sayadiyesi: derin karamelize soğanlı baharatlı pilav üzerinde beyaz balık; ağır ağır kavrulan soğanlar yemeğe imza rengini ve tuzlu-tatlı derinliğini verir, kavrulmuş çam fıstığı ve limonla tamamlanır.",
      cuisineLabel: "Lübnan",
      tips: [
        "Soğanları sabırla kavurun — koyu renkleri sayadiye pilavını kahverengi ve aromalı yapan şeydir.",
        "En dolu lezzet için pirinci balık suyunda (veya soğan suyunda) pişirin.",
        "Balığı ayrı mühürleyin ki altın rengi kalsın ve pilava dağılmasın.",
      ],
      storageTip:
        "Buzdolabında 2 güne kadar saklayın; pilavı kapağı kapalı ısıtın ve balığı nemli kalması için hafifçe ısıtın.",
      steps: [
        "Balığı tuz, biber, biraz kimyon ve limonla tatlandırıp bir kenara alın.",
        "Soğanları zeytinyağında ağır ağır koyulaşana dek kavurun; bir kısmını süs için ayırın.",
        "Kimyon, tarçın ve yenibaharı soğanlara karıştırın, sonra pirinci ekleyip kısaca kavurun.",
        "Sıcak su veya balık suyu ekleyin, tuzlayın ve pirinci kabarık ve koyu renkli olana dek pişirin.",
        "Balık filetolarını ayrı olarak altın rengi ve tam pişene dek mühürleyin.",
        "Soğanlı pilavı tabağa yığın, üzerine balığı koyun ve kavrulmuş çam fıstığı, ayrılan soğanlar ve limon dilimleriyle tamamlayın.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 3,
    baseServingsMax: 4,
    servingLabel: "Serves 3–4",
    scalingNote:
      "Scale the fish and rice together and brown enough onions — they are the flavour base, so do not skimp. Add cumin, cinnamon and salt gradually to taste rather than multiplying the spice.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A platter of caramelized-onion browned spiced rice topped with pan-seared white fish fillets, garnished with toasted pine nuts and a lemon wedge.",
    platingNotes:
      "Fish arranged over brown onion rice; keep the platter centered.",
    culturalAuthenticityNotes:
      "Sayadiyeh's identity is the deep caramelized-onion brown rice with fish — not plain grilled fish with white rice.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/sayadiyeh.jpg",
  },
};

const MUSAKHAN: GeneratedRecipe = {
  matchKeys: [
    "palestinian musakhan",
    "musakhan",
    "musakkhan",
    "mussakhan",
    "مسخن",
    "مسخّن فلسطيني",
  ],
  canonicalTitle: "Palestinian Musakhan",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Palestinian (Levantine)",
  prepMinutes: 80,
  difficulty: "medium",
  servings: 4,
  mealTypes: ["main"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "special"],
  proteinCategory: "chicken",
  budgetTier: "medium",
  suitability: ["guest_friendly", "everyday_host", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_meat"],
  allergens: ["Gluten", "Nuts"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["chicken", "flatbread", "onion", "sumac", "olive oil", "pine nuts"],
  pantryIngredients: [
    { canonicalId: "chicken", role: "critical", tokens: ["chicken"] },
    { canonicalId: "flatbread", role: "critical", tokens: ["flatbread", "taboon", "bread"] },
    { canonicalId: "onion", role: "critical", tokens: ["onion"] },
    { canonicalId: "sumac", role: "critical", tokens: ["sumac"] },
    { canonicalId: "pine-nuts", role: "garnish", tokens: ["pine nuts"] },
    { canonicalId: "olive-oil", role: "supporting", tokens: ["olive oil"] },
  ],
  ingredients: [
    { id: "chicken", en: "Chicken", de: "Hähnchen", ar: "دجاج", tr: "Tavuk", detailEn: "1 chicken in pieces (or 4 thighs)", detailDe: "1 Hähnchen in Teilen (oder 4 Schenkel)", detailAr: "دجاجة مقطّعة (أو 4 أفخاذ)", detailTr: "1 parça tavuk (veya 4 but)", status: "need" },
    { id: "flatbread", en: "Taboon or flatbread", de: "Taboon- oder Fladenbrot", ar: "خبز طابون أو خبز عربي", tr: "Taboon veya yassı ekmek", detailEn: "4 rounds", detailDe: "4 Fladen", detailAr: "4 أرغفة", detailTr: "4 adet", status: "need" },
    { id: "onion", en: "Onions", de: "Zwiebeln", ar: "بصل", tr: "Soğan", detailEn: "5 large, thinly sliced", detailDe: "5 große, in dünne Scheiben", detailAr: "5 حبات كبيرة، شرائح رفيعة", detailTr: "5 büyük, ince dilimlenmiş", status: "need" },
    { id: "sumac", en: "Sumac", de: "Sumach", ar: "سماق", tr: "Sumak", detailEn: "1/4 cup (generous)", detailDe: "1/4 Tasse (großzügig)", detailAr: "ربع كوب (بسخاء)", detailTr: "1/4 su bardağı (bolca)", status: "need" },
    { id: "olive-oil", en: "Olive oil", de: "Olivenöl", ar: "زيت زيتون", tr: "Zeytinyağı", detailEn: "1/2 cup (generous)", detailDe: "1/2 Tasse (großzügig)", detailAr: "نصف كوب (بسخاء)", detailTr: "1/2 su bardağı (bolca)", status: "need" },
    { id: "pine-nuts", en: "Pine nuts", de: "Pinienkerne", ar: "صنوبر", tr: "Çam fıstığı", detailEn: "1/3 cup, toasted", detailDe: "1/3 Tasse, geröstet", detailAr: "ثلث كوب، محمّص", detailTr: "1/3 su bardağı, kavrulmuş", status: "need" },
    { id: "allspice", en: "Allspice & cardamom", de: "Piment & Kardamom", ar: "بهار حلو وهيل", tr: "Yenibahar ve kakule", detailEn: "1 tsp allspice + 1/2 tsp cardamom", detailDe: "1 TL Piment + 1/2 TL Kardamom", detailAr: "ملعقة صغيرة بهار + نصف ملعقة هيل", detailTr: "1 tatlı kaşığı yenibahar + 1/2 kakule", status: "need" },
    { id: "salt", en: "Salt & pepper", de: "Salz & Pfeffer", ar: "ملح وفلفل", tr: "Tuz ve biber", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Palestinian musakhan: roasted chicken over taboon bread piled with sweet sumac-stained onions and olive oil, scattered with toasted pine nuts — the bread, softened onions and sumac are the heart of the dish.",
      cuisineLabel: "Palestinian",
      tips: [
        "Be generous with the onions, sumac and olive oil — musakhan is defined by their abundance, not by the chicken alone.",
        "Let the onions cook down until sweet and soft before folding in the sumac.",
        "Warm and lightly crisp the bread so it soaks up the oil without going soggy.",
      ],
      storageTip:
        "Keep the chicken and sumac onions in the fridge up to 3 days; assemble on freshly warmed bread just before serving.",
      steps: [
        "Season the chicken with allspice, cardamom, salt, pepper and a little sumac and olive oil, then roast until golden and cooked through.",
        "Meanwhile cook the sliced onions gently in plenty of olive oil until very soft and sweet.",
        "Stir the generous sumac into the onions so they turn deep burgundy and tangy.",
        "Warm and lightly crisp the taboon or flatbread, then spread it with a layer of the sumac onions.",
        "Set the roasted chicken on the bread and spoon more sumac onions and pan juices over.",
        "Scatter with toasted pine nuts and serve hot, tearing the bread as the base.",
      ],
    },
    de: {
      reason:
        "Palästinensisches Musakhan: gebratenes Hähnchen auf Taboon-Brot, belegt mit süßen, sumach-gefärbten Zwiebeln und Olivenöl, bestreut mit gerösteten Pinienkernen — Brot, weiche Zwiebeln und Sumach sind das Herz des Gerichts.",
      cuisineLabel: "Palästinensisch",
      tips: [
        "Großzügig mit Zwiebeln, Sumach und Olivenöl sein — Musakhan lebt von deren Fülle, nicht vom Hähnchen allein.",
        "Die Zwiebeln weich und süß einkochen lassen, bevor der Sumach untergehoben wird.",
        "Das Brot erwärmen und leicht knusprig machen, damit es das Öl aufnimmt, ohne durchzuweichen.",
      ],
      storageTip:
        "Hähnchen und Sumach-Zwiebeln bis zu 3 Tage im Kühlschrank aufbewahren; erst kurz vor dem Servieren auf frisch erwärmtem Brot anrichten.",
      steps: [
        "Das Hähnchen mit Piment, Kardamom, Salz, Pfeffer sowie etwas Sumach und Olivenöl würzen und goldbraun garbraten.",
        "Inzwischen die Zwiebeln in reichlich Olivenöl sanft sehr weich und süß garen.",
        "Den großzügigen Sumach unter die Zwiebeln rühren, bis sie tief burgunderrot und säuerlich sind.",
        "Das Taboon- oder Fladenbrot erwärmen und leicht knusprig machen, dann mit einer Schicht Sumach-Zwiebeln bestreichen.",
        "Das gebratene Hähnchen auf das Brot setzen und mehr Sumach-Zwiebeln und Bratensaft darüber geben.",
        "Mit gerösteten Pinienkernen bestreuen und heiß servieren, das Brot als Basis zum Zerteilen.",
      ],
    },
    ar: {
      reason:
        "مسخّن فلسطيني: دجاج مشوي فوق خبز الطابون مع بصل مكرمل بالسماق وزيت الزيتون، ويُنثر عليه الصنوبر المحمّص — الخبز والبصل الطري والسماق هي قلب الطبق.",
      cuisineLabel: "فلسطيني",
      tips: [
        "كوني سخية بالبصل والسماق وزيت الزيتون — فالمسخّن يتميّز بوفرتها لا بالدجاج وحده.",
        "اتركي البصل ينضج حتى يصبح حلواً وطرياً قبل إضافة السماق.",
        "سخّني الخبز وقرمشيه قليلاً كي يمتصّ الزيت دون أن يطرى أكثر من اللازم.",
      ],
      storageTip:
        "احفظي الدجاج وبصل السماق في الثلاجة حتى 3 أيام؛ ركّبي الطبق على خبز دافئ طازج قبل التقديم مباشرة.",
      steps: [
        "تبّلي الدجاج بالبهار والهيل والملح والفلفل وقليل من السماق وزيت الزيتون، ثم اشويه حتى يذهبّ وينضج.",
        "في هذه الأثناء اطبخي البصل بهدوء في كمية وافرة من زيت الزيتون حتى يصبح طرياً جداً وحلواً.",
        "أضيفي السماق بسخاء إلى البصل حتى يتحوّل إلى لون خمري غامق وحامض.",
        "سخّني خبز الطابون أو الخبز وقرمشيه قليلاً، ثم افرشي عليه طبقة من بصل السماق.",
        "ضعي الدجاج المشوي على الخبز وأضيفي مزيداً من بصل السماق وعصارة الشوي.",
        "انثري الصنوبر المحمّص وقدّميه ساخناً، مع تقطيع الخبز كقاعدة.",
      ],
    },
    tr: {
      reason:
        "Filistin musahanı: taboon ekmeği üzerinde kızarmış tavuk, bol tatlı sumaklı soğan ve zeytinyağıyla kaplanır, kavrulmuş çam fıstığı serpilir — ekmek, yumuşamış soğan ve sumak yemeğin kalbidir.",
      cuisineLabel: "Filistin",
      tips: [
        "Soğan, sumak ve zeytinyağında cömert olun — musahan bunların bolluğuyla tanımlanır, tek başına tavukla değil.",
        "Sumağı katmadan önce soğanları tatlı ve yumuşak olana dek pişirin.",
        "Ekmeği ısıtıp hafif çıtırlaştırın ki yağı emsin ama ıslanmasın.",
      ],
      storageTip:
        "Tavuk ve sumaklı soğanı buzdolabında 3 güne kadar saklayın; servisten hemen önce taze ısıtılmış ekmeğin üzerinde birleştirin.",
      steps: [
        "Tavuğu yenibahar, kakule, tuz, biber ve biraz sumak ile zeytinyağıyla tatlandırın, sonra altın rengi ve pişene dek kızartın.",
        "Bu sırada dilimlenmiş soğanları bol zeytinyağında çok yumuşak ve tatlı olana dek pişirin.",
        "Bol sumağı soğanlara karıştırın ki koyu bordo ve ekşimsi olsunlar.",
        "Taboon veya yassı ekmeği ısıtıp hafif çıtırlaştırın, sonra üzerine bir kat sumaklı soğan sürün.",
        "Kızarmış tavuğu ekmeğin üzerine koyun ve üstüne daha fazla sumaklı soğan ve tava suyu gezdirin.",
        "Kavrulmuş çam fıstığı serpin ve ekmeği taban olarak koparıp sıcak servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 5,
    servingLabel: "About 4 flatbreads · serves 4–5",
    scalingNote:
      "Scale the chicken and bread by portion (about one flatbread per person) and cook plenty of sumac onions — they are the dish, so keep them generous. Add sumac and salt to the onions gradually to taste rather than multiplying blindly.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A round taboon flatbread topped with roasted chicken and an abundant layer of sumac-stained softened onions glistening with olive oil, scattered with toasted pine nuts.",
    platingNotes:
      "Bread-based dish with chicken and sumac onions on top; keep the whole flatbread centered.",
    culturalAuthenticityNotes:
      "Musakhan must read as bread-based with abundant sumac onions and pine nuts — clearly distinct from the existing Sumac Chicken recipe, which must not be modified.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/musakhan.jpg",
  },
};

const MAQLUBA: GeneratedRecipe = {
  matchKeys: [
    "palestinian maqluba",
    "maqluba",
    "maqlooba",
    "makloubeh",
    "maqlubeh",
    "مقلوبة",
    "مقلوبة فلسطينية",
  ],
  canonicalTitle: "Palestinian Maqluba",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Palestinian (Levantine)",
  prepMinutes: 90,
  difficulty: "medium",
  servings: 6,
  mealTypes: ["main", "rice"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "special", "high_calorie"],
  proteinCategory: "mixed",
  budgetTier: "medium",
  suitability: ["guest_friendly", "everyday_host", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_meat"],
  allergens: ["Nuts"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["chicken", "rice", "eggplant", "cauliflower", "onion", "allspice", "almonds"],
  pantryIngredients: [
    { canonicalId: "chicken", role: "critical", tokens: ["chicken"] },
    { canonicalId: "rice", role: "critical", tokens: ["rice"] },
    { canonicalId: "eggplant", role: "supporting", tokens: ["eggplant", "aubergine"] },
    { canonicalId: "cauliflower", role: "supporting", tokens: ["cauliflower"] },
    { canonicalId: "almonds", role: "garnish", tokens: ["almonds", "pine nuts"] },
  ],
  ingredients: [
    { id: "chicken", en: "Chicken", de: "Hähnchen", ar: "دجاج", tr: "Tavuk", detailEn: "1 kg pieces (or lamb)", detailDe: "1 kg Teile (oder Lamm)", detailAr: "1 كغ قطع (أو لحم غنم)", detailTr: "1 kg parça (veya kuzu)", status: "need" },
    { id: "rice", en: "Rice", de: "Reis", ar: "أرز", tr: "Pirinç", detailEn: "2.5 cups (500 g)", detailDe: "2,5 Tassen (500 g)", detailAr: "كوبان ونصف (500 غرام)", detailTr: "2,5 su bardağı (500 g)", status: "need" },
    { id: "eggplant", en: "Eggplant", de: "Aubergine", ar: "باذنجان", tr: "Patlıcan", detailEn: "2, sliced and fried", detailDe: "2, in Scheiben und gebraten", detailAr: "حبتان، شرائح ومقلية", detailTr: "2, dilimlenip kızartılmış", status: "need" },
    { id: "cauliflower", en: "Cauliflower", de: "Blumenkohl", ar: "قرنبيط", tr: "Karnabahar", detailEn: "1/2 head, florets fried", detailDe: "1/2 Kopf, Röschen gebraten", detailAr: "نصف رأس، زهيرات مقلية", detailTr: "1/2 baş, çiçekleri kızartılmış", status: "need" },
    { id: "potato", en: "Potato", de: "Kartoffel", ar: "بطاطا", tr: "Patates", detailEn: "2, sliced (optional layer)", detailDe: "2, in Scheiben (optionale Schicht)", detailAr: "حبتان، شرائح (طبقة اختيارية)", detailTr: "2, dilimlenmiş (isteğe bağlı kat)", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "1, quartered", detailDe: "1, geviertelt", detailAr: "حبة واحدة، مقطّعة أرباعاً", detailTr: "1, dörde bölünmüş", status: "need" },
    { id: "maqluba-spice", en: "Maqluba spice", de: "Maqluba-Gewürz", ar: "بهار مقلوبة", tr: "Maklube baharatı", detailEn: "2 tsp (allspice, cinnamon, cardamom, turmeric, pepper)", detailDe: "2 TL (Piment, Zimt, Kardamom, Kurkuma, Pfeffer)", detailAr: "ملعقتان صغيرتان (بهار، قرفة، هيل، كركم، فلفل)", detailTr: "2 tatlı kaşığı (yenibahar, tarçın, kakule, zerdeçal, biber)", status: "need" },
    { id: "almonds", en: "Almonds & pine nuts", de: "Mandeln & Pinienkerne", ar: "لوز وصنوبر", tr: "Badem ve çam fıstığı", detailEn: "1/3 cup, toasted (garnish)", detailDe: "1/3 Tasse, geröstet (Garnitur)", detailAr: "ثلث كوب، محمّص (للتزيين)", detailTr: "1/3 su bardağı, kavrulmuş (süs)", status: "need" },
    { id: "oil", en: "Oil", de: "Öl", ar: "زيت", tr: "Yağ", detailEn: "for frying", detailDe: "zum Braten", detailAr: "للقلي", detailTr: "kızartmak için", status: "need" },
    { id: "salt", en: "Salt", de: "Salz", ar: "ملح", tr: "Tuz", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Palestinian maqluba — literally 'upside-down': chicken and fried vegetables layered under spiced rice in a pot, then flipped out into a striking layered dome and topped with toasted nuts.",
      cuisineLabel: "Palestinian",
      tips: [
        "Layer the vegetables neatly against the pot base — they become the decorative top once flipped.",
        "Rest the pot before flipping so the dome holds together, then flip in one confident motion.",
        "Keep the broth just covering the rice for an even, tender cook.",
      ],
      storageTip:
        "Refrigerate up to 3 days; reheat covered with a little water or broth so the rice stays moist.",
      steps: [
        "Simmer the chicken with the onion and maqluba spice until cooked, then reserve the spiced broth.",
        "Fry the eggplant, cauliflower and potato slices until golden, then drain.",
        "Rinse the rice and season it with a little of the spice mix.",
        "In a heavy pot, layer the chicken on the bottom, then the fried vegetables, then the rice.",
        "Pour the reserved broth over to just cover the rice, then cook gently until the rice is tender and the liquid absorbed.",
        "Rest for 10 minutes, invert the pot onto a platter and lift it to reveal the dome; garnish with toasted almonds and pine nuts.",
      ],
    },
    de: {
      reason:
        "Palästinensisches Maqluba — wörtlich 'umgedreht': Hähnchen und gebratenes Gemüse unter gewürztem Reis im Topf geschichtet, dann als eindrucksvolle Schicht-Kuppel gestürzt und mit gerösteten Nüssen bestreut.",
      cuisineLabel: "Palästinensisch",
      tips: [
        "Das Gemüse ordentlich an den Topfboden schichten — es wird nach dem Stürzen zur dekorativen Oberseite.",
        "Den Topf vor dem Stürzen ruhen lassen, damit die Kuppel hält, dann in einer beherzten Bewegung stürzen.",
        "Die Brühe knapp über dem Reis halten für ein gleichmäßiges, zartes Garen.",
      ],
      storageTip:
        "Bis zu 3 Tage kühlen; zugedeckt mit etwas Wasser oder Brühe erwärmen, damit der Reis saftig bleibt.",
      steps: [
        "Das Hähnchen mit Zwiebel und Maqluba-Gewürz garen, dann die gewürzte Brühe beiseitestellen.",
        "Auberginen-, Blumenkohl- und Kartoffelscheiben goldbraun braten, dann abtropfen lassen.",
        "Den Reis abspülen und mit etwas Gewürzmischung würzen.",
        "In einem schweren Topf das Hähnchen unten schichten, dann das gebratene Gemüse, dann den Reis.",
        "Die zurückbehaltene Brühe knapp über den Reis gießen, dann sanft garen, bis der Reis zart und die Flüssigkeit aufgesogen ist.",
        "10 Minuten ruhen lassen, den Topf auf eine Platte stürzen und anheben, um die Kuppel freizulegen; mit gerösteten Mandeln und Pinienkernen garnieren.",
      ],
    },
    ar: {
      reason:
        "مقلوبة فلسطينية — حرفياً 'مقلوبة': دجاج وخضار مقلية تُرصّ تحت أرز متبّل في القدر، ثم تُقلب لتصبح قبّة طبقات لافتة تُزيَّن بالمكسّرات المحمّصة.",
      cuisineLabel: "فلسطيني",
      tips: [
        "رصّي الخضار بأناقة على قاع القدر — فهي تصبح الوجه الزخرفي بعد القلب.",
        "اتركي القدر يرتاح قبل القلب كي تتماسك القبّة، ثم اقلبيه بحركة واحدة واثقة.",
        "أبقي المرق يغطّي الأرز بالكاد لطهي متساوٍ وطري.",
      ],
      storageTip:
        "تُحفظ في الثلاجة حتى 3 أيام؛ أعيدي التسخين مغطّاة مع قليل من الماء أو المرق كي يبقى الأرز طرياً.",
      steps: [
        "اطبخي الدجاج مع البصل وبهار المقلوبة حتى ينضج، ثم احتفظي بالمرق المتبّل.",
        "اقلي شرائح الباذنجان والقرنبيط والبطاطا حتى تذهبّ، ثم صفّيها.",
        "اغسلي الأرز وتبّليه بقليل من خلطة البهار.",
        "في قدر ثقيل، رصّي الدجاج في القاع، ثم الخضار المقلية، ثم الأرز.",
        "اسكبي المرق المحفوظ حتى يغطّي الأرز بالكاد، ثم اطبخي بهدوء حتى ينضج الأرز ويُمتصّ السائل.",
        "اتركيها 10 دقائق، اقلبي القدر على صحن وارفعيه لتظهر القبّة؛ زيّني باللوز والصنوبر المحمّص.",
      ],
    },
    tr: {
      reason:
        "Filistin maklubesi — kelime anlamıyla 'baş aşağı': tavuk ve kızarmış sebzeler tencerede baharatlı pirincin altına katmanlanır, sonra çarpıcı bir katmanlı kubbe halinde ters çevrilir ve kavrulmuş kuruyemişle süslenir.",
      cuisineLabel: "Filistin",
      tips: [
        "Sebzeleri tencere tabanına düzgünce dizin — ters çevrilince dekoratif üst yüzey olurlar.",
        "Kubbe dağılmasın diye tencereyi çevirmeden önce dinlendirin, sonra tek ve kararlı bir hareketle çevirin.",
        "Eşit ve yumuşak pişme için et suyunu pirinci ancak örtecek kadar tutun.",
      ],
      storageTip:
        "Buzdolabında 3 güne kadar saklayın; pirinç nemli kalsın diye biraz su veya et suyuyla kapağı kapalı ısıtın.",
      steps: [
        "Tavuğu soğan ve maklube baharatıyla pişene dek haşlayın, sonra baharatlı et suyunu ayırın.",
        "Patlıcan, karnabahar ve patates dilimlerini altın rengi olana dek kızartıp süzün.",
        "Pirinci yıkayıp biraz baharat karışımıyla tatlandırın.",
        "Ağır bir tencerede tavuğu dibe, sonra kızarmış sebzeleri, sonra pirinci katman katman dizin.",
        "Ayrılan et suyunu pirinci ancak örtecek kadar dökün, sonra pirinç yumuşayıp su çekilene dek hafifçe pişirin.",
        "10 dakika dinlendirin, tencereyi bir tabağa ters çevirip kaldırarak kubbeyi ortaya çıkarın; kavrulmuş badem ve çam fıstığıyla süsleyin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 5,
    baseServingsMax: 6,
    servingLabel: "One inverted pot · serves 5–6",
    scalingNote:
      "Use a wider, taller pot and scale the chicken, vegetables and rice together, keeping enough broth to just cover the rice. Add the spice mix gradually to taste so the rice is fragrant, not overpowering; a confident, quick flip gives the cleanest dome.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A turned-out Palestinian maqluba: an inverted dome of spiced rice layered with fried eggplant, cauliflower and chicken, garnished with toasted almonds and pine nuts.",
    platingNotes:
      "The molded upside-down dome on a round platter is the hero; keep it centered.",
    culturalAuthenticityNotes:
      "Maqluba's identity is the inverted, molded rice-and-vegetable dome — the turned-out presentation must be visible.",
    focalPointX: 50,
    focalPointY: 45,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/maqluba.jpg",
  },
};

const MANSAF: GeneratedRecipe = {
  matchKeys: [
    "jordanian mansaf",
    "mansaf",
    "mansaff",
    "منسف",
    "منسف أردني",
  ],
  canonicalTitle: "Jordanian Mansaf",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Jordanian (Levantine)",
  prepMinutes: 120,
  difficulty: "medium",
  servings: 6,
  mealTypes: ["main", "rice"],
  mealSlotRole: "dinner_complete",
  mealIntents: ["family_friendly", "special", "high_calorie"],
  proteinCategory: "lamb",
  budgetTier: "premium",
  suitability: ["guest_friendly", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_meat", "contains_dairy"],
  allergens: ["Dairy", "Nuts", "Gluten"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["lamb", "jameed", "rice", "flatbread", "almonds", "cardamom"],
  pantryIngredients: [
    { canonicalId: "lamb", role: "critical", tokens: ["lamb", "mutton"] },
    { canonicalId: "jameed", role: "critical", tokens: ["jameed", "yogurt"] },
    { canonicalId: "rice", role: "critical", tokens: ["rice"] },
    { canonicalId: "flatbread", role: "supporting", tokens: ["flatbread", "shrak", "bread"] },
    { canonicalId: "almonds", role: "garnish", tokens: ["almonds", "pine nuts"] },
  ],
  ingredients: [
    { id: "lamb", en: "Lamb", de: "Lamm", ar: "لحم غنم", tr: "Kuzu eti", detailEn: "1.2 kg bone-in pieces", detailDe: "1,2 kg Stücke mit Knochen", detailAr: "1.2 كغ قطع بالعظم", detailTr: "1,2 kg kemikli parça", status: "need" },
    { id: "jameed", en: "Jameed (dried fermented yogurt)", de: "Jameed (getrockneter fermentierter Joghurt)", ar: "جميد (لبن مجفّف مخمّر)", tr: "Cemid (kurutulmuş fermente yoğurt)", detailEn: "500 g reconstituted (or 1 L yogurt cooked down)", detailDe: "500 g aufgelöst (oder 1 L Joghurt eingekocht)", detailAr: "500 غرام مذاب (أو 1 لتر لبن مطبوخ حتى يثخن)", detailTr: "500 g sulandırılmış (veya 1 L yoğurt koyulaştırılmış)", status: "need" },
    { id: "rice", en: "Rice", de: "Reis", ar: "أرز", tr: "Pirinç", detailEn: "3 cups (600 g)", detailDe: "3 Tassen (600 g)", detailAr: "3 أكواب (600 غرام)", detailTr: "3 su bardağı (600 g)", status: "need" },
    { id: "flatbread", en: "Shrak / markook flatbread", de: "Shrak-/Markook-Fladenbrot", ar: "خبز شراك / مرقوق", tr: "Şırak / markuk yassı ekmek", detailEn: "2–3 large sheets", detailDe: "2–3 große Blätter", detailAr: "2–3 أرغفة كبيرة", detailTr: "2–3 büyük yaprak", status: "need" },
    { id: "almonds", en: "Almonds & pine nuts", de: "Mandeln & Pinienkerne", ar: "لوز وصنوبر", tr: "Badem ve çam fıstığı", detailEn: "1/2 cup, toasted", detailDe: "1/2 Tasse, geröstet", detailAr: "نصف كوب، محمّص", detailTr: "1/2 su bardağı, kavrulmuş", status: "need" },
    { id: "cardamom", en: "Cardamom & bay", de: "Kardamom & Lorbeer", ar: "هيل وورق غار", tr: "Kakule ve defne", detailEn: "5 pods, 2 bay leaves", detailDe: "5 Kapseln, 2 Lorbeer", detailAr: "5 حبات هيل، ورقتا غار", detailTr: "5 kapsül, 2 defne", status: "need" },
    { id: "allspice", en: "Allspice & pepper", de: "Piment & Pfeffer", ar: "بهار حلو وفلفل", tr: "Yenibahar ve biber", detailEn: "1 tsp allspice + pepper", detailDe: "1 TL Piment + Pfeffer", detailAr: "ملعقة صغيرة بهار + فلفل", detailTr: "1 tatlı kaşığı yenibahar + biber", status: "need" },
    { id: "ghee", en: "Ghee (samn)", de: "Ghee (Samn)", ar: "سمن", tr: "Sadeyağ (samn)", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "parsley", en: "Parsley", de: "Petersilie", ar: "بقدونس", tr: "Maydanoz", detailEn: "to garnish", detailDe: "zum Garnieren", detailAr: "للتزيين", detailTr: "süslemek için", status: "need" },
    { id: "salt", en: "Salt", de: "Salz", ar: "ملح", tr: "Tuz", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Jordan's national dish: lamb slow-cooked and served over rice and flatbread, blanketed in a warm tangy jameed (fermented yogurt) sauce and scattered with toasted nuts — a celebratory communal platter.",
      cuisineLabel: "Jordanian",
      tips: [
        "Stir the jameed sauce constantly in one direction as it heats so it stays smooth and does not split.",
        "Keep the sauce hot but never at a hard boil once the jameed is in.",
        "Traditionally eaten together from one platter — serve extra jameed sauce on the side.",
      ],
      storageTip:
        "Keep the lamb, rice and sauce separate in the fridge up to 3 days; reheat the sauce gently, stirring, and warm the lamb through before assembling.",
      steps: [
        "Simmer the lamb with the cardamom, bay, allspice and a little salt until very tender, skimming the broth.",
        "Reconstitute and blend the jameed until smooth, then whisk it into the strained lamb broth.",
        "Cook the jameed sauce gently, stirring constantly in one direction, until smooth and just simmering — do not let it split.",
        "Cook the rice, tinting it lightly, using some of the broth for flavour.",
        "Lay the shrak or markook flatbread on a large platter and moisten it with a little jameed sauce.",
        "Spread the rice over the bread, arrange the lamb on top, ladle over plenty of hot jameed sauce, and scatter with toasted almonds, pine nuts and parsley; serve extra sauce alongside.",
      ],
    },
    de: {
      reason:
        "Jordaniens Nationalgericht: langsam gegartes Lamm auf Reis und Fladenbrot, überzogen von einer warmen, säuerlichen Jameed-Sauce (fermentierter Joghurt) und mit gerösteten Nüssen bestreut — eine festliche Gemeinschaftsplatte.",
      cuisineLabel: "Jordanisch",
      tips: [
        "Die Jameed-Sauce beim Erhitzen ständig in eine Richtung rühren, damit sie glatt bleibt und nicht gerinnt.",
        "Die Sauce heiß halten, aber nach Zugabe des Jameed nie stark kochen lassen.",
        "Traditionell gemeinsam von einer Platte gegessen — extra Jameed-Sauce dazu reichen.",
      ],
      storageTip:
        "Lamm, Reis und Sauce getrennt bis zu 3 Tage kühlen; die Sauce sanft unter Rühren erwärmen und das Lamm vor dem Anrichten durchwärmen.",
      steps: [
        "Das Lamm mit Kardamom, Lorbeer, Piment und etwas Salz sehr zart köcheln, dabei die Brühe abschäumen.",
        "Das Jameed auflösen und glatt pürieren, dann in die abgeseihte Lammbrühe rühren.",
        "Die Jameed-Sauce sanft und ständig in eine Richtung rührend erhitzen, bis sie glatt ist und gerade siedet — nicht gerinnen lassen.",
        "Den Reis garen, leicht einfärben und einen Teil der Brühe für den Geschmack verwenden.",
        "Das Shrak- oder Markook-Fladenbrot auf eine große Platte legen und mit etwas Jameed-Sauce befeuchten.",
        "Den Reis auf dem Brot verteilen, das Lamm darauf anrichten, reichlich heiße Jameed-Sauce darüber geben und mit gerösteten Mandeln, Pinienkernen und Petersilie bestreuen; extra Sauce dazu reichen.",
      ],
    },
    ar: {
      reason:
        "الطبق الوطني الأردني: لحم غنم يُطهى ببطء ويُقدّم فوق الأرز والخبز، مغطّى بصلصة الجميد (اللبن المخمّر) الدافئة الحامضة ومنثوراً عليه المكسّرات المحمّصة — صحن احتفالي يُؤكل جماعياً.",
      cuisineLabel: "أردني",
      tips: [
        "حرّكي صلصة الجميد باستمرار باتجاه واحد أثناء التسخين كي تبقى ناعمة ولا تتخثّر.",
        "أبقي الصلصة ساخنة لكن دون غليان قوي بعد إضافة الجميد.",
        "يُؤكل تقليدياً معاً من صحن واحد — قدّمي مزيداً من صلصة الجميد جانباً.",
      ],
      storageTip:
        "احفظي اللحم والأرز والصلصة منفصلة في الثلاجة حتى 3 أيام؛ أعيدي تسخين الصلصة بهدوء مع التحريك وسخّني اللحم قبل التركيب.",
      steps: [
        "اطبخي اللحم مع الهيل وورق الغار والبهار وقليل من الملح حتى يصبح طرياً جداً، مع إزالة الرغوة عن المرق.",
        "أذيبي الجميد واخلطيه حتى ينعم، ثم أضيفيه إلى مرق اللحم المصفّى.",
        "اطبخي صلصة الجميد بهدوء مع التحريك المستمرّ باتجاه واحد حتى تنعم وتكاد تغلي — دون أن تتخثّر.",
        "اطبخي الأرز ولوّنيه قليلاً، مستخدمة بعض المرق للنكهة.",
        "افرشي خبز الشراك أو المرقوق على صحن كبير ورطّبيه بقليل من صلصة الجميد.",
        "افردي الأرز فوق الخبز، رتّبي اللحم فوقه، اسكبي كمية وافرة من صلصة الجميد الساخنة، وانثري اللوز والصنوبر المحمّص والبقدونس؛ قدّمي مزيداً من الصلصة جانباً.",
      ],
    },
    tr: {
      reason:
        "Ürdün'ün ulusal yemeği: ağır ateşte pişen kuzu, pirinç ve yassı ekmek üzerinde servis edilir, sıcak ekşimsi cemid (fermente yoğurt) sosuyla kaplanır ve kavrulmuş kuruyemişle serpilir — kutlama niteliğinde ortak bir tabak.",
      cuisineLabel: "Ürdün",
      tips: [
        "Cemid sosunu ısınırken sürekli tek yönde karıştırın ki pürüzsüz kalsın ve kesilmesin.",
        "Cemid eklendikten sonra sosu sıcak tutun ama asla kuvvetli kaynatmayın.",
        "Geleneksel olarak tek tabaktan birlikte yenir — yanında fazladan cemid sosu sunun.",
      ],
      storageTip:
        "Kuzu, pirinç ve sosu buzdolabında ayrı ayrı 3 güne kadar saklayın; sosu karıştırarak hafifçe ısıtın ve kuzuyu birleştirmeden önce ısıtın.",
      steps: [
        "Kuzuyu kakule, defne, yenibahar ve biraz tuzla çok yumuşayana dek pişirin, suyun köpüğünü alın.",
        "Cemidi sulandırıp pürüzsüz olana dek karıştırın, sonra süzülmüş kuzu suyuna ekleyin.",
        "Cemid sosunu sürekli tek yönde karıştırarak pürüzsüz ve kaynama noktasına gelene dek hafifçe pişirin — kesilmesine izin vermeyin.",
        "Pirinci hafif renklendirip lezzet için bir kısım et suyuyla pişirin.",
        "Şırak veya markuk ekmeği büyük bir tabağa serip biraz cemid sosuyla nemlendirin.",
        "Pirinci ekmeğin üzerine yayın, kuzuyu üstüne dizin, bolca sıcak cemid sosu gezdirin ve kavrulmuş badem, çam fıstığı ve maydanozla serpin; yanında fazladan sos sunun.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 5,
    baseServingsMax: 8,
    servingLabel: "One large platter · serves 5–8 (communal)",
    scalingNote:
      "Scale the lamb, rice and jameed together and keep the sauce hot and smooth, stirring in one direction. Adjust the salt and jameed tang gradually to taste rather than multiplying, so the sauce stays balanced and does not overwhelm the lamb.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "A large platter with flatbread topped with yellow-tinged rice and bone-in lamb pieces, drizzled with warm white jameed sauce, scattered with toasted almonds and pine nuts, with a bowl of extra jameed sauce.",
    platingNotes:
      "Communal platter with bread base, rice, lamb and jameed sauce; keep the platter centered.",
    culturalAuthenticityNotes:
      "Mansaf must show lamb over rice and bread with a distinct white jameed (fermented yogurt) sauce — not a generic lamb-and-rice plate.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/mansaf.jpg",
  },
};

export const ARAB_BATCH_1_GROUP_C: GeneratedRecipe[] = [
  CHICKEN_SHAWARMA,
  SAYADIYEH,
  MUSAKHAN,
  MAQLUBA,
  MANSAF,
];
