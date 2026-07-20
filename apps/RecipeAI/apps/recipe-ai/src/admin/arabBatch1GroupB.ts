/**
 * Arabic catalog expansion — Batch 1, Group B (Levantine meat & mezze).
 *
 * Curated, human-authored Recipe Studio generation fixtures. Studio drafts only:
 * generated results enter Recipe QA = Draft and Photo QA = Pending and are never
 * promoted to the consumer catalog automatically.
 *
 * NOTE: Kibbeh Nayyeh is a RAW-MEAT preparation. It is honestly tagged
 * contains_meat (never vegetarian/vegan) and carries a concise food-safety note.
 */

import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";

const KIBBEH_NAYYEH: GeneratedRecipe = {
  matchKeys: [
    "kibbeh nayyeh",
    "kibbeh nayeh",
    "kibbe nayyeh",
    "raw kibbeh",
    "كبة نية",
    "كبة نيئة",
  ],
  canonicalTitle: "Kibbeh Nayyeh",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 40,
  difficulty: "medium",
  servings: 5,
  mealTypes: ["side"],
  mealSlotRole: "side_component",
  mealIntents: ["special", "family_friendly"],
  proteinCategory: "lamb",
  budgetTier: "premium",
  suitability: ["guest_friendly", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_meat"],
  allergens: ["Gluten"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["lamb", "bulgur", "onion", "allspice", "mint", "olive oil"],
  pantryIngredients: [
    { canonicalId: "lamb", role: "critical", tokens: ["lamb", "meat"] },
    { canonicalId: "bulgur", role: "critical", tokens: ["bulgur"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
    { canonicalId: "olive-oil", role: "supporting", tokens: ["olive oil"] },
    { canonicalId: "mint", role: "garnish", tokens: ["mint"] },
  ],
  ingredients: [
    { id: "lamb", en: "Very fresh lean lamb", de: "Sehr frisches, mageres Lamm", ar: "لحم غنم طازج قليل الدهن", tr: "Çok taze yağsız kuzu", detailEn: "300 g, well-trimmed, trusted source, kept cold", detailDe: "300 g, gut pariert, vertrauenswürdige Quelle, kalt gehalten", detailAr: "300 غرام، منزوع الدهن، من مصدر موثوق، محفوظ بارداً", detailTr: "300 g, iyi temizlenmiş, güvenilir kaynak, soğuk tutulmuş", status: "need" },
    { id: "bulgur", en: "Fine bulgur (#1)", de: "Feiner Bulgur (#1)", ar: "برغل ناعم", tr: "İnce bulgur", detailEn: "1/2 cup, rinsed and squeezed dry", detailDe: "1/2 Tasse, gespült und trocken gedrückt", detailAr: "نصف كوب، مغسول ومعصور", detailTr: "1/2 su bardağı, yıkanıp suyu sıkılmış", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "1/2, very finely grated", detailDe: "1/2, sehr fein gerieben", detailAr: "نصف حبة، مبشورة ناعماً جداً", detailTr: "1/2, çok ince rendelenmiş", status: "need" },
    { id: "allspice", en: "Allspice & cinnamon", de: "Piment & Zimt", ar: "بهار حلو وقرفة", tr: "Yenibahar ve tarçın", detailEn: "1 tsp allspice + 1/4 tsp cinnamon", detailDe: "1 TL Piment + 1/4 TL Zimt", detailAr: "ملعقة صغيرة بهار + ربع ملعقة قرفة", detailTr: "1 tatlı kaşığı yenibahar + 1/4 tarçın", status: "need" },
    { id: "salt-pepper", en: "Salt & white pepper", de: "Salz & weißer Pfeffer", ar: "ملح وفلفل أبيض", tr: "Tuz ve beyaz biber", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
    { id: "ice-water", en: "Ice water", de: "Eiswasser", ar: "ماء مثلّج", tr: "Buzlu su", detailEn: "2–3 tbsp, for smoothing", detailDe: "2–3 EL, zum Glätten", detailAr: "2–3 ملاعق كبيرة، للتنعيم", detailTr: "2–3 yemek kaşığı, pürüzsüzleştirmek için", status: "need" },
    { id: "olive-oil", en: "Olive oil", de: "Olivenöl", ar: "زيت زيتون", tr: "Zeytinyağı", detailEn: "to drizzle generously", detailDe: "großzügig zum Beträufeln", detailAr: "للرش بسخاء", detailTr: "bolca gezdirmek için", status: "need" },
    { id: "mint", en: "Fresh mint", de: "Frische Minze", ar: "نعناع طازج", tr: "Taze nane", detailEn: "a few leaves, to garnish", detailDe: "einige Blätter, zum Garnieren", detailAr: "بضع أوراق، للتزيين", detailTr: "birkaç yaprak, süslemek için", status: "need" },
    { id: "scallion", en: "Scallion", de: "Frühlingszwiebel", ar: "بصل أخضر", tr: "Yeşil soğan", detailEn: "1, sliced, to garnish", detailDe: "1, in Ringen, zum Garnieren", detailAr: "حبة واحدة، شرائح، للتزيين", detailTr: "1 adet, dilimlenmiş, süslemek için", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "A Levantine celebration mezze: very fresh lean lamb pounded smooth with fine bulgur and warm spices, served cold with olive oil, mint and flatbread. This is a raw-meat dish.",
      cuisineLabel: "Syrian",
      tips: [
        "Food safety: use very fresh, high-quality lean meat from a trusted butcher, keep everything cold throughout, and serve immediately. Raw preparations are not advisable for pregnant people, young children, the elderly or anyone immune-compromised.",
        "Keep a bowl of iced water to wet your hands and smooth the surface.",
        "Serve with olive oil, fresh mint, scallion and warm flatbread alongside.",
      ],
      storageTip:
        "Kibbeh nayyeh is raw and is best eaten immediately — do not store the raw dish. Any unused fresh mixture should be cooked thoroughly the same day (for example as fried or baked kibbeh) and refrigerated promptly.",
      steps: [
        "Keep the lamb very cold. Rinse the fine bulgur and squeeze it thoroughly dry.",
        "Grate the onion finely and mix it with the allspice, cinnamon, salt and white pepper.",
        "Work the lamb, bulgur and spiced onion together, adding a little ice water, until very smooth and cohesive — keep everything cold as you work.",
        "Taste a tiny amount and adjust the seasoning; the paste should be smooth, cold and well seasoned.",
        "Spread on a chilled platter, smooth the surface and press traditional grooves with wet fingers.",
        "Drizzle generously with olive oil, garnish with mint and scallion, and serve immediately while cold.",
      ],
    },
    de: {
      reason:
        "Ein festliches levantinisches Mezze: sehr frisches, mageres Lamm glatt gestoßen mit feinem Bulgur und warmen Gewürzen, kalt serviert mit Olivenöl, Minze und Fladenbrot. Dies ist ein Rohfleisch-Gericht.",
      cuisineLabel: "Syrisch",
      tips: [
        "Lebensmittelsicherheit: sehr frisches, hochwertiges mageres Fleisch von einem vertrauenswürdigen Metzger verwenden, alles durchgehend kalt halten und sofort servieren. Rohe Zubereitungen sind für Schwangere, Kleinkinder, ältere und immungeschwächte Menschen nicht ratsam.",
        "Eine Schüssel Eiswasser bereithalten, um die Hände zu befeuchten und die Oberfläche zu glätten.",
        "Mit Olivenöl, frischer Minze, Frühlingszwiebel und warmem Fladenbrot servieren.",
      ],
      storageTip:
        "Kibbeh Nayyeh ist roh und wird am besten sofort gegessen — das rohe Gericht nicht aufbewahren. Übrige frische Masse sollte am selben Tag gründlich durchgegart (z. B. als gebratenes oder gebackenes Kibbeh) und rasch gekühlt werden.",
      steps: [
        "Das Lamm sehr kalt halten. Den feinen Bulgur spülen und gründlich trocken drücken.",
        "Die Zwiebel fein reiben und mit Piment, Zimt, Salz und weißem Pfeffer mischen.",
        "Lamm, Bulgur und gewürzte Zwiebel mit etwas Eiswasser zu einer sehr glatten, bindigen Masse verarbeiten — dabei alles kalt halten.",
        "Eine winzige Menge abschmecken und würzen; die Masse soll glatt, kalt und gut gewürzt sein.",
        "Auf einer gekühlten Platte verstreichen, glätten und mit nassen Fingern die typischen Rillen eindrücken.",
        "Großzügig mit Olivenöl beträufeln, mit Minze und Frühlingszwiebel garnieren und sofort kalt servieren.",
      ],
    },
    ar: {
      reason:
        "مزة احتفالية شامية: لحم غنم طازج قليل الدهن يُدقّ ناعماً مع البرغل الناعم والبهارات الدافئة، ويُقدّم بارداً مع زيت الزيتون والنعناع والخبز. هذا طبق لحم نيء.",
      cuisineLabel: "سوري",
      tips: [
        "سلامة الغذاء: استخدمي لحماً طازجاً عالي الجودة قليل الدهن من جزّار موثوق، وحافظي على برودة كل شيء، وقدّميه فوراً. الأطباق النيئة غير مناسبة للحوامل والأطفال الصغار وكبار السن وضعاف المناعة.",
        "احتفظي بوعاء ماء مثلّج لترطيب يديك وتنعيم السطح.",
        "قدّميه مع زيت الزيتون والنعناع الطازج والبصل الأخضر والخبز الدافئ.",
      ],
      storageTip:
        "الكبة النية طبق نيء ويُفضّل تناوله فوراً — لا تحفظي الطبق النيء. أي كمية طازجة متبقية يجب طهيها جيداً في اليوم نفسه (مثلاً ككبة مقلية أو مشوية) وتبريدها بسرعة.",
      steps: [
        "حافظي على برودة اللحم. اغسلي البرغل الناعم واعصريه جيداً.",
        "ابشري البصل ناعماً واخلطيه مع البهار والقرفة والملح والفلفل الأبيض.",
        "اعجني اللحم والبرغل والبصل المتبّل معاً مع قليل من الماء المثلّج حتى يصبح المزيج ناعماً جداً ومتماسكاً — مع إبقاء كل شيء بارداً.",
        "تذوّقي كمية صغيرة جداً وعدّلي التتبيل؛ يجب أن يكون المزيج ناعماً وبارداً ومتبّلاً جيداً.",
        "افرديه على صحن مبرّد، نعّمي السطح واضغطي الخطوط التقليدية بأصابع مبلّلة.",
        "رشّي زيت الزيتون بسخاء، زيّني بالنعناع والبصل الأخضر، وقدّميه فوراً وهو بارد.",
      ],
    },
    tr: {
      reason:
        "Şölen niteliğinde bir Levanten meze: çok taze yağsız kuzu, ince bulgur ve sıcak baharatlarla pürüzsüz olana dek dövülür, soğuk olarak zeytinyağı, nane ve yassı ekmekle sunulur. Bu bir çiğ et yemeğidir.",
      cuisineLabel: "Suriye",
      tips: [
        "Gıda güvenliği: güvenilir bir kasaptan çok taze, kaliteli yağsız et kullanın, her şeyi baştan sona soğuk tutun ve hemen servis edin. Çiğ hazırlıklar hamileler, küçük çocuklar, yaşlılar ve bağışıklığı zayıf kişiler için önerilmez.",
        "Ellerinizi ıslatıp yüzeyi düzeltmek için buzlu su bulundurun.",
        "Zeytinyağı, taze nane, yeşil soğan ve sıcak yassı ekmekle servis edin.",
      ],
      storageTip:
        "Kibbeh nayyeh çiğdir ve hemen yenmesi en iyisidir — çiğ yemeği saklamayın. Kullanılmayan taze karışım aynı gün iyice pişirilmeli (örneğin kızarmış veya fırınlanmış kibbeh olarak) ve hemen buzdolabına konmalıdır.",
      steps: [
        "Kuzuyu çok soğuk tutun. İnce bulguru yıkayıp iyice sıkarak kurutun.",
        "Soğanı ince rendeleyip yenibahar, tarçın, tuz ve beyaz biberle karıştırın.",
        "Kuzu, bulgur ve baharatlı soğanı biraz buzlu su ekleyerek çok pürüzsüz ve tutarlı olana dek yoğurun — her şeyi soğuk tutun.",
        "Çok küçük bir miktar tadıp baharatı ayarlayın; karışım pürüzsüz, soğuk ve iyi baharatlı olmalı.",
        "Soğutulmuş bir tabağa yayın, yüzeyi düzleştirin ve ıslak parmaklarla geleneksel oluklar açın.",
        "Bolca zeytinyağı gezdirin, nane ve yeşil soğanla süsleyin ve soğukken hemen servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "Small mezze platter · 4–6 small portions",
    scalingNote:
      "Scale the meat and bulgur together and keep everything cold while you work. Add the allspice, cinnamon and salt gradually and taste a small amount — raw kibbeh should be smooth and well seasoned, not heavily spiced. Only prepare as much as will be eaten immediately.",
  },
  defaultRole: "side",
  canServeAsMain: true,
  photo: {
    brief:
      "A small elegant plate of smooth raw minced-lamb-and-fine-bulgur kibbeh nayyeh, spread flat with traditional finger grooves, drizzled with olive oil and garnished with mint and scallion.",
    platingNotes:
      "Small round portion on a plate with grooves and olive oil; keep it centered, restrained garnish, no competing dish.",
    culturalAuthenticityNotes:
      "Kibbeh nayyeh is a raw lamb-and-bulgur mezze with fine texture and finger grooves; it must read as a small, elegant raw preparation, not cooked kibbeh.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/kibbeh-nayyeh.jpg",
  },
};

const FRIED_KIBBEH: GeneratedRecipe = {
  matchKeys: [
    "fried kibbeh",
    "kibbeh maqliyeh",
    "kibbe maqliya",
    "fried kibbe",
    "كبة مقلية",
    "كبة مقليّة",
  ],
  canonicalTitle: "Fried Kibbeh",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 75,
  difficulty: "medium",
  servings: 5,
  mealTypes: ["side"],
  mealSlotRole: "side_component",
  mealIntents: ["special", "family_friendly"],
  proteinCategory: "mixed",
  budgetTier: "medium",
  suitability: ["guest_friendly", "shareable"],
  moods: ["special"],
  dietaryTags: ["contains_meat"],
  allergens: ["Gluten", "Nuts"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["bulgur", "minced beef", "onion", "pine nuts", "allspice"],
  pantryIngredients: [
    { canonicalId: "bulgur", role: "critical", tokens: ["bulgur"] },
    { canonicalId: "minced-meat", role: "critical", tokens: ["minced beef", "minced lamb", "meat"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
    { canonicalId: "pine-nuts", role: "supporting", tokens: ["pine nuts"] },
  ],
  ingredients: [
    { id: "bulgur", en: "Fine bulgur (#1)", de: "Feiner Bulgur (#1)", ar: "برغل ناعم", tr: "İnce bulgur", detailEn: "1.5 cups, soaked and squeezed dry", detailDe: "1,5 Tassen, eingeweicht und ausgedrückt", detailAr: "كوب ونصف، منقوع ومعصور", detailTr: "1,5 su bardağı, ıslatılıp sıkılmış", status: "need" },
    { id: "shell-meat", en: "Lean minced beef (shell)", de: "Mageres Rinderhack (Hülle)", ar: "لحم بقر مفروم قليل الدهن (للعجينة)", tr: "Yağsız dana kıyma (dış)", detailEn: "250 g", detailDe: "250 g", detailAr: "250 غرام", detailTr: "250 g", status: "need" },
    { id: "filling-meat", en: "Minced lamb or beef (filling)", de: "Lamm- oder Rinderhack (Füllung)", ar: "لحم مفروم غنم أو بقر (للحشوة)", tr: "Kuzu veya dana kıyma (iç)", detailEn: "250 g", detailDe: "250 g", detailAr: "250 غرام", detailTr: "250 g", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "1 large, finely chopped", detailDe: "1 große, fein gehackt", detailAr: "حبة كبيرة، مفرومة ناعماً", detailTr: "1 büyük, ince doğranmış", status: "need" },
    { id: "pine-nuts", en: "Pine nuts", de: "Pinienkerne", ar: "صنوبر", tr: "Çam fıstığı", detailEn: "1/4 cup, toasted", detailDe: "1/4 Tasse, geröstet", detailAr: "ربع كوب، محمّص", detailTr: "1/4 su bardağı, kavrulmuş", status: "need" },
    { id: "allspice", en: "Allspice & cinnamon", de: "Piment & Zimt", ar: "بهار حلو وقرفة", tr: "Yenibahar ve tarçın", detailEn: "1.5 tsp allspice + 1/2 tsp cinnamon", detailDe: "1,5 TL Piment + 1/2 TL Zimt", detailAr: "ملعقة ونصف بهار + نصف ملعقة قرفة", detailTr: "1,5 tatlı kaşığı yenibahar + 1/2 tarçın", status: "need" },
    { id: "salt-pepper", en: "Salt & pepper", de: "Salz & Pfeffer", ar: "ملح وفلفل", tr: "Tuz ve biber", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
    { id: "oil", en: "Oil for frying", de: "Öl zum Frittieren", ar: "زيت للقلي", tr: "Kızartmak için yağ", detailEn: "for deep-frying", detailDe: "zum Frittieren", detailAr: "للقلي العميق", detailTr: "derin kızartma için", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Crisp fried torpedoes with a thin bulgur-and-beef shell around a spiced minced-meat and pine-nut filling — a Levantine favourite served hot as part of a mezze spread.",
      cuisineLabel: "Syrian",
      tips: [
        "Keep the shell paste cold and your hands wet so it stays smooth and easy to shape.",
        "Toast the pine nuts and cool the filling before stuffing so the shells seal well.",
        "Fry in small batches so the oil stays hot and the shells turn crisp, not greasy.",
      ],
      storageTip:
        "Fry fresh; cooked kibbeh keeps 2 days refrigerated and reheats crisp in a hot oven. Uncooked shaped kibbeh freezes well and can be fried from frozen.",
      steps: [
        "Soak the fine bulgur, then squeeze it thoroughly dry.",
        "Make the shell: blend the lean minced beef, bulgur, half the allspice, cinnamon, salt and pepper into a smooth, cohesive paste, keeping it cold.",
        "Make the filling: fry the onion until soft, add the remaining minced meat and brown, season with the rest of the spices and stir in the toasted pine nuts, then cool.",
        "Wet your hands, take a ball of shell paste and hollow it into a thin-walled shell.",
        "Fill with the meat-and-pine-nut filling and seal into a torpedo shape, tapering the ends.",
        "Heat the oil and fry the kibbeh in batches until deep golden and crisp.",
        "Drain on paper and serve hot with lemon and a yogurt or tahini dip on the side.",
      ],
    },
    de: {
      reason:
        "Knusprige frittierte Kroketten mit dünner Bulgur-Rindfleisch-Hülle um eine gewürzte Hackfleisch-Pinienkern-Füllung — ein levantinischer Favorit, heiß als Teil eines Mezze serviert.",
      cuisineLabel: "Syrisch",
      tips: [
        "Die Hüllenmasse kalt halten und die Hände nass halten, damit sie glatt und leicht formbar bleibt.",
        "Die Pinienkerne rösten und die Füllung vor dem Füllen abkühlen lassen, damit die Hüllen gut schließen.",
        "In kleinen Portionen frittieren, damit das Öl heiß bleibt und die Hüllen knusprig statt fettig werden.",
      ],
      storageTip:
        "Frisch frittieren; gegartes Kibbeh hält 2 Tage im Kühlschrank und wird im heißen Ofen wieder knusprig. Ungegartes geformtes Kibbeh lässt sich gut einfrieren und tiefgefroren frittieren.",
      steps: [
        "Den feinen Bulgur einweichen, dann gründlich trocken drücken.",
        "Hülle zubereiten: mageres Rinderhack, Bulgur, die Hälfte von Piment, Zimt, Salz und Pfeffer zu einer glatten, bindigen Masse verarbeiten und kalt halten.",
        "Füllung zubereiten: die Zwiebel weich braten, das restliche Hackfleisch zugeben und anbräunen, mit den restlichen Gewürzen würzen, die gerösteten Pinienkerne unterrühren und abkühlen lassen.",
        "Mit nassen Händen eine Kugel Hüllenmasse nehmen und zu einer dünnwandigen Hülle aushöhlen.",
        "Mit der Hackfleisch-Pinienkern-Füllung füllen und zu einer Torpedoform verschließen, die Enden zuspitzen.",
        "Das Öl erhitzen und das Kibbeh portionsweise tief goldbraun und knusprig frittieren.",
        "Auf Küchenpapier abtropfen lassen und heiß mit Zitrone und einem Joghurt- oder Tahini-Dip servieren.",
      ],
    },
    ar: {
      reason:
        "أصابع مقلية مقرمشة بقشرة رقيقة من البرغل واللحم حول حشوة لحم مفروم متبّلة بالصنوبر — من أشهر أطباق المزة الشامية، تُقدّم ساخنة.",
      cuisineLabel: "سوري",
      tips: [
        "أبقي عجينة القشرة باردة ويديك مبلّلتين كي تبقى ناعمة وسهلة التشكيل.",
        "حمّصي الصنوبر وبرّدي الحشوة قبل الحشو كي تُغلق الأقراص جيداً.",
        "اقلي على دفعات صغيرة كي يبقى الزيت ساخناً وتصبح القشرة مقرمشة لا دهنية.",
      ],
      storageTip:
        "اقليها طازجة؛ تحفظ الكبة المطهوة يومين في الثلاجة وتستعيد قرمشتها في فرن ساخن. أما الكبة النيئة المشكّلة فتُجمّد جيداً وتُقلى مجمّدة.",
      steps: [
        "انقعي البرغل الناعم ثم اعصريه جيداً.",
        "حضّري القشرة: اخلطي لحم البقر المفروم قليل الدهن مع البرغل ونصف البهار والقرفة والملح والفلفل حتى تصبح عجينة ناعمة متماسكة، وأبقيها باردة.",
        "حضّري الحشوة: اقلي البصل حتى يليّن، أضيفي باقي اللحم المفروم وحمّريه، تبّليه بباقي البهارات وأضيفي الصنوبر المحمّص، ثم برّديه.",
        "بلّلي يديك، خذي كرة من عجينة القشرة وفرّغيها لتصبح قشرة رقيقة الجدران.",
        "احشيها بحشوة اللحم والصنوبر وأغلقيها بشكل أصابع مدبّبة الطرفين.",
        "سخّني الزيت واقلي الكبة على دفعات حتى تصبح ذهبية غامقة ومقرمشة.",
        "صفّيها على ورق وقدّميها ساخنة مع الليمون وصلصة لبن أو طحينة جانباً.",
      ],
    },
    tr: {
      reason:
        "İnce bulgur-dana kabuğu içinde baharatlı kıyma ve çam fıstığı harcı olan çıtır kızarmış içli köfteler — sıcak sunulan sevilen bir Levanten mezesi.",
      cuisineLabel: "Suriye",
      tips: [
        "Kabuk hamurunu soğuk, ellerinizi ıslak tutun ki pürüzsüz ve kolay şekillensin.",
        "Çam fıstığını kavurun ve iç harcı doldurmadan soğutun ki kabuklar iyi kapansın.",
        "Küçük partiler halinde kızartın ki yağ sıcak kalsın, kabuklar yağlı değil çıtır olsun.",
      ],
      storageTip:
        "Taze kızartın; pişmiş kibbeh buzdolabında 2 gün durur ve sıcak fırında yeniden çıtırlaşır. Pişmemiş şekil verilmiş kibbeh iyi donar ve dondurulmuş halde kızartılabilir.",
      steps: [
        "İnce bulguru ıslatın, sonra iyice sıkarak kurutun.",
        "Kabuğu yapın: yağsız dana kıyma, bulgur, yenibaharın yarısı, tarçın, tuz ve biberi pürüzsüz, tutarlı bir hamur olana dek yoğurun ve soğuk tutun.",
        "İç harcı yapın: soğanı yumuşayana dek kavurun, kalan kıymayı ekleyip kızartın, kalan baharatlarla tatlandırın, kavrulmuş çam fıstığını karıştırıp soğutun.",
        "Ellerinizi ıslatın, bir top kabuk hamurunu oyup ince duvarlı bir kabuk yapın.",
        "Kıyma-çam fıstığı harcıyla doldurun ve uçları sivri torpido şeklinde kapatın.",
        "Yağı ısıtın ve içli köfteleri partiler halinde koyu altın rengi ve çıtır olana dek kızartın.",
        "Kağıtta süzdürün ve limon ile yoğurt veya tahin soslu olarak sıcak servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "Makes ~16–18 pieces · 4–6 as mezze (3–4 as a light main)",
    scalingNote:
      "Scale the shell and filling in the same proportion and keep the shell paste cold for easy shaping. Season the filling to taste rather than multiplying the spices, and fry in batches so the oil stays hot and the shells crisp.",
  },
  defaultRole: "side",
  canServeAsMain: true,
  photo: {
    brief:
      "A plate of golden-brown fried kibbeh torpedoes with crisp bulgur shells, one broken open to reveal a spiced minced-meat and pine-nut filling, with a lemon wedge.",
    platingNotes:
      "Fried kibbeh is the single hero; one cut open to show the filling, restrained garnish, no competing dish.",
    culturalAuthenticityNotes:
      "Fried kibbeh must clearly show the torpedo/oval shape with a crisp cracked-wheat shell and meat-and-pine-nut filling; do not let raw kibbeh appear as a second dish.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/fried-kibbeh.jpg",
  },
};

const WARAK_ENAB_MEAT: GeneratedRecipe = {
  matchKeys: [
    "syrian stuffed grape leaves with meat",
    "stuffed grape leaves with meat",
    "warak enab bil lahme",
    "warak enab meat",
    "warak enab lahme",
    "ورق عنب باللحم",
    "ورق عنب باللحمة",
  ],
  canonicalTitle: "Syrian Stuffed Grape Leaves with Meat",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 100,
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
  ingredientTokens: ["grape leaves", "minced lamb", "rice", "garlic", "lemon", "tomato"],
  pantryIngredients: [
    { canonicalId: "grape-leaves", role: "critical", tokens: ["grape leaves", "vine leaves"] },
    { canonicalId: "minced-meat", role: "critical", tokens: ["minced lamb", "minced beef", "meat"] },
    { canonicalId: "rice", role: "critical", tokens: ["rice"] },
    { canonicalId: "lemon-juice", role: "supporting", tokens: ["lemon", "lemon juice"] },
    { canonicalId: "garlic", role: "supporting", tokens: ["garlic"] },
    { canonicalId: "tomato", role: "supporting", tokens: ["tomato"] },
  ],
  ingredients: [
    { id: "grape-leaves", en: "Grape (vine) leaves", de: "Weinblätter", ar: "ورق عنب", tr: "Asma yaprağı", detailEn: "about 50 leaves, rinsed", detailDe: "ca. 50 Blätter, abgespült", detailAr: "حوالي 50 ورقة، مغسولة", detailTr: "yaklaşık 50 yaprak, yıkanmış", status: "need" },
    { id: "minced-meat", en: "Minced lamb or beef", de: "Lamm- oder Rinderhack", ar: "لحم مفروم غنم أو بقر", tr: "Kuzu veya dana kıyma", detailEn: "400 g", detailDe: "400 g", detailAr: "400 غرام", detailTr: "400 g", status: "need" },
    { id: "rice", en: "Short-grain rice", de: "Rundkornreis", ar: "أرز قصير الحبة", tr: "Kısa taneli pirinç", detailEn: "1 cup (200 g), rinsed", detailDe: "1 Tasse (200 g), abgespült", detailAr: "كوب واحد (200 غرام)، مغسول", detailTr: "1 su bardağı (200 g), yıkanmış", status: "need" },
    { id: "lamb-chops", en: "Lamb chops or bones", de: "Lammkoteletts oder Knochen", ar: "ريش أو عظام غنم", tr: "Kuzu pirzola veya kemik", detailEn: "300 g, for the pot base", detailDe: "300 g, für den Topfboden", detailAr: "300 غرام، لقاع القدر", detailTr: "300 g, tencere tabanı için", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "1, finely chopped", detailDe: "1, fein gehackt", detailAr: "حبة واحدة، مفرومة ناعماً", detailTr: "1 adet, ince doğranmış", status: "need" },
    { id: "tomato", en: "Tomato", de: "Tomate", ar: "طماطم", tr: "Domates", detailEn: "1, diced + 1 tbsp paste", detailDe: "1, gewürfelt + 1 EL Mark", detailAr: "حبة مقطّعة + ملعقة معجون", detailTr: "1 doğranmış + 1 yk salça", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "6 whole cloves", detailDe: "6 ganze Zehen", detailAr: "6 فصوص كاملة", detailTr: "6 bütün diş", status: "need" },
    { id: "lemon-juice", en: "Lemon juice", de: "Zitronensaft", ar: "عصير ليمون", tr: "Limon suyu", detailEn: "1/3 cup", detailDe: "1/3 Tasse", detailAr: "ثلث كوب", detailTr: "1/3 su bardağı", status: "need" },
    { id: "baharat", en: "Baharat (allspice, cinnamon, pepper)", de: "Baharat (Piment, Zimt, Pfeffer)", ar: "بهارات (بهار، قرفة، فلفل)", tr: "Baharat (yenibahar, tarçın, biber)", detailEn: "2 tsp", detailDe: "2 TL", detailAr: "ملعقتان صغيرتان", detailTr: "2 tatlı kaşığı", status: "need" },
    { id: "olive-oil", en: "Olive oil", de: "Olivenöl", ar: "زيت زيتون", tr: "Zeytinyağı", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "salt", en: "Salt", de: "Salz", ar: "ملح", tr: "Tuz", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "The hearty meat version of stuffed vine leaves: leaves rolled around a spiced lamb-and-rice filling, simmered over lamb pieces in a garlicky, lemony broth — a Levantine family main, distinct from the meatless mezze yalanji.",
      cuisineLabel: "Syrian",
      tips: [
        "Line the pot with the lamb chops/bones — they enrich the broth and stop the rolls from scorching.",
        "Roll firmly but not too tight so the rice has room to swell as it cooks.",
        "Weigh the rolls down with a plate so they stay closed while simmering.",
      ],
      storageTip:
        "Refrigerate up to 3 days; reheat gently with a splash of the cooking broth. It tastes even better the next day.",
      steps: [
        "Rinse the grape leaves; if brined, soak to remove excess salt, then trim tough stems.",
        "Make the filling: mix the minced meat, rice, chopped onion, diced tomato, tomato paste, baharat, salt and a little olive oil.",
        "Place a leaf shiny-side down, add a line of filling near the stem, fold the sides and roll firmly.",
        "Line the pot base with the lamb chops or bones and a few spare leaves, tucking the whole garlic cloves among them.",
        "Pack the rolls seam-side down in tight layers over the meat.",
        "Add the lemon juice, remaining olive oil and enough water or stock to just cover, then weigh down with a plate.",
        "Cover and simmer gently for about 1 hour until the rice and meat filling are cooked and the leaves are tender; rest, then serve warm.",
      ],
    },
    de: {
      reason:
        "Die herzhafte Fleischversion der gefüllten Weinblätter: Blätter um eine gewürzte Lamm-Reis-Füllung gerollt, über Lammstücken in einer knoblauchigen, zitronigen Brühe geschmort — ein levantinisches Familien-Hauptgericht, deutlich anders als das fleischlose Mezze Yalanji.",
      cuisineLabel: "Syrisch",
      tips: [
        "Den Topf mit den Lammkoteletts/Knochen auslegen — sie bereichern die Brühe und verhindern das Anbrennen der Röllchen.",
        "Fest, aber nicht zu straff rollen, damit der Reis beim Garen quellen kann.",
        "Die Röllchen mit einem Teller beschweren, damit sie beim Köcheln geschlossen bleiben.",
      ],
      storageTip:
        "Bis zu 3 Tage kühlen; mit einem Schuss Kochbrühe sanft erwärmen. Am nächsten Tag schmeckt es noch besser.",
      steps: [
        "Die Weinblätter abspülen; eingelegte kurz wässern, um überschüssiges Salz zu entfernen, dann harte Stiele entfernen.",
        "Füllung anrühren: Hackfleisch, Reis, gehackte Zwiebel, gewürfelte Tomate, Tomatenmark, Baharat, Salz und etwas Olivenöl vermengen.",
        "Ein Blatt mit der glänzenden Seite nach unten legen, eine Linie Füllung ans Stielende geben, die Seiten einschlagen und fest aufrollen.",
        "Den Topfboden mit den Lammkoteletts oder Knochen und einigen übrigen Blättern auslegen, die ganzen Knoblauchzehen dazwischen verteilen.",
        "Die Röllchen mit der Naht nach unten in dichten Schichten über dem Fleisch schichten.",
        "Zitronensaft, restliches Olivenöl und so viel Wasser oder Brühe angießen, dass alles knapp bedeckt ist, dann mit einem Teller beschweren.",
        "Zugedeckt etwa 1 Stunde sanft köcheln, bis Reis und Fleischfüllung gar und die Blätter zart sind; ruhen lassen, dann warm servieren.",
      ],
    },
    ar: {
      reason:
        "النسخة الدسمة من ورق العنب المحشي: أوراق تُلفّ حول حشوة لحم وأرز متبّلة، وتُطهى فوق قطع لحم في مرق بالثوم والليمون — طبق شامي رئيسي للعائلة، مختلف عن مزة اليالنجي الخالية من اللحم.",
      cuisineLabel: "سوري",
      tips: [
        "افرشي قعر القدر بريش أو عظام الغنم — فهي تُثري المرق وتمنع احتراق اللفائف.",
        "لفّي بإحكام دون شدّ زائد كي يتمدّد الأرز أثناء الطهي.",
        "اضغطي اللفائف بصحن كي تبقى مغلقة أثناء الطهي.",
      ],
      storageTip:
        "تُحفظ في الثلاجة حتى 3 أيام؛ أعيدي تسخينها بهدوء مع رشة من مرق الطهي. تكون ألذّ في اليوم التالي.",
      steps: [
        "اغسلي ورق العنب؛ وإن كان مخللاً فانقعيه لإزالة الملح الزائد ثم أزيلي السيقان القاسية.",
        "حضّري الحشوة: اخلطي اللحم المفروم والأرز والبصل المفروم والطماطم المقطّعة ومعجون الطماطم والبهارات والملح وقليلاً من زيت الزيتون.",
        "ضعي الورقة بالجهة اللامعة للأسفل، وزّعي خطاً من الحشوة قرب الساق، اطوِ الجوانب ولفّيها بإحكام.",
        "افرشي قعر القدر بريش أو عظام الغنم وبعض الأوراق الإضافية، ووزّعي فصوص الثوم الكاملة بينها.",
        "رصّي اللفائف بحيث يكون الطي للأسفل في طبقات متلاصقة فوق اللحم.",
        "أضيفي عصير الليمون وباقي زيت الزيتون وكمية كافية من الماء أو المرق حتى يكاد يغطّيها، ثم اضغطيها بصحن.",
        "غطّي القدر واطهيه بهدوء حوالي ساعة حتى ينضج الأرز والحشوة وتلين الأوراق؛ اتركيه يرتاح ثم قدّميه دافئاً.",
      ],
    },
    tr: {
      reason:
        "Asma yaprağı sarmanın doyurucu etli versiyonu: yapraklar baharatlı kuzu-pirinç harcıyla sarılır, kuzu parçalarının üzerinde sarımsaklı, limonlu bir suda pişirilir — etsiz meze yalancıdan farklı bir Levanten aile ana yemeği.",
      cuisineLabel: "Suriye",
      tips: [
        "Tencerenin tabanını kuzu pirzola/kemikle kaplayın — hem suyu zenginleştirir hem sarmaların yanmasını önler.",
        "Pirincin pişerken şişmesi için sıkı ama çok gergin olmayacak şekilde sarın.",
        "Sarmaların açılmaması için bir tabakla bastırın.",
      ],
      storageTip:
        "Buzdolabında 3 güne kadar saklayın; biraz pişirme suyuyla hafifçe ısıtın. Ertesi gün daha da lezzetli olur.",
      steps: [
        "Asma yapraklarını yıkayın; salamuraysa fazla tuzunu almak için ıslatın, sonra sert sapları kesin.",
        "Harcı hazırlayın: kıyma, pirinç, doğranmış soğan, doğranmış domates, salça, baharat, tuz ve biraz zeytinyağını karıştırın.",
        "Yaprağı parlak yüzü alta gelecek şekilde koyun, sap tarafına harç şeridi yerleştirin, kenarları katlayıp sıkıca sarın.",
        "Tencerenin tabanını kuzu pirzola veya kemikle ve birkaç yedek yaprakla kaplayın, bütün sarımsak dişlerini aralarına yerleştirin.",
        "Sarmaları birleşim yeri alta gelecek şekilde etin üzerine sıkı katmanlar halinde dizin.",
        "Limon suyu, kalan zeytinyağı ve üzerini ancak örtecek kadar su veya et suyu ekleyin, sonra bir tabakla bastırın.",
        "Kapağı kapatıp yaklaşık 1 saat, pirinç ve etli harç pişip yapraklar yumuşayana dek hafifçe pişirin; dinlendirip ılık servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "Makes ~45–50 rolls · serves 4–6 as a main",
    scalingNote:
      "Scale the leaves, meat and rice together and keep the lamb pieces at the base for flavour. Balance the lemon and salt in the cooking liquid gradually to taste rather than multiplying, so the broth stays bright but not sour.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "Tightly rolled vine-leaf rolls in a pot with bone-in lamb pieces nestled among them, glistening in a lemony broth, one roll cut to show a meat-and-rice filling.",
    platingNotes:
      "Rolls packed in the pot with lamb pieces visible; keep the pot/arrangement centered.",
    culturalAuthenticityNotes:
      "This is the meat-and-rice Levantine version cooked over lamb in a garlicky lemon broth — it must clearly differ from the meatless yalanji.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/warak-enab-meat.jpg",
  },
};

const SHEIKH_AL_MAHSHI: GeneratedRecipe = {
  matchKeys: [
    "sheikh al mahshi",
    "sheikh el mahshi",
    "shaykh al mahshi",
    "sheikh mahshi",
    "شيخ المحشي",
    "شيخ المحشى",
  ],
  canonicalTitle: "Sheikh al-Mahshi",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 75,
  difficulty: "medium",
  servings: 5,
  mealTypes: ["main"],
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
  ingredientTokens: ["eggplant", "minced lamb", "pine nuts", "onion", "tomato", "allspice"],
  pantryIngredients: [
    { canonicalId: "eggplant", role: "critical", tokens: ["eggplant", "aubergine"] },
    { canonicalId: "minced-meat", role: "critical", tokens: ["minced lamb", "minced beef", "meat"] },
    { canonicalId: "pine-nuts", role: "supporting", tokens: ["pine nuts"] },
    { canonicalId: "tomato", role: "supporting", tokens: ["tomato"] },
    { canonicalId: "onion", role: "supporting", tokens: ["onion"] },
  ],
  ingredients: [
    { id: "eggplant", en: "Baby eggplants", de: "Baby-Auberginen", ar: "باذنجان صغير", tr: "Bebek patlıcan", detailEn: "8 small, hollowed", detailDe: "8 kleine, ausgehöhlt", detailAr: "8 حبات صغيرة، مفرّغة", detailTr: "8 küçük, içi oyulmuş", status: "need" },
    { id: "minced-meat", en: "Minced lamb or beef", de: "Lamm- oder Rinderhack", ar: "لحم مفروم غنم أو بقر", tr: "Kuzu veya dana kıyma", detailEn: "400 g", detailDe: "400 g", detailAr: "400 غرام", detailTr: "400 g", status: "need" },
    { id: "pine-nuts", en: "Pine nuts", de: "Pinienkerne", ar: "صنوبر", tr: "Çam fıstığı", detailEn: "1/3 cup, toasted", detailDe: "1/3 Tasse, geröstet", detailAr: "ثلث كوب، محمّص", detailTr: "1/3 su bardağı, kavrulmuş", status: "need" },
    { id: "onion", en: "Onion", de: "Zwiebel", ar: "بصل", tr: "Soğan", detailEn: "1, finely chopped", detailDe: "1, fein gehackt", detailAr: "حبة واحدة، مفرومة ناعماً", detailTr: "1 adet, ince doğranmış", status: "need" },
    { id: "tomato", en: "Tomato", de: "Tomate", ar: "طماطم", tr: "Domates", detailEn: "3, grated + 2 tbsp paste", detailDe: "3, gerieben + 2 EL Mark", detailAr: "3 حبات مبشورة + ملعقتان معجون", detailTr: "3 rendelenmiş + 2 yk salça", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "3 cloves, minced", detailDe: "3 Zehen, gehackt", detailAr: "3 فصوص، مفرومة", detailTr: "3 diş, ezilmiş", status: "need" },
    { id: "allspice", en: "Allspice & cinnamon", de: "Piment & Zimt", ar: "بهار حلو وقرفة", tr: "Yenibahar ve tarçın", detailEn: "1.5 tsp allspice + 1/2 tsp cinnamon", detailDe: "1,5 TL Piment + 1/2 TL Zimt", detailAr: "ملعقة ونصف بهار + نصف ملعقة قرفة", detailTr: "1,5 tatlı kaşığı yenibahar + 1/2 tarçın", status: "need" },
    { id: "olive-oil", en: "Olive oil", de: "Olivenöl", ar: "زيت زيتون", tr: "Zeytinyağı", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "salt", en: "Salt & pepper", de: "Salz & Pfeffer", ar: "ملح وفلفل", tr: "Tuz ve biber", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Sheikh al-mahshi — 'the master of stuffed dishes': tender baby eggplants filled with spiced minced meat and pine nuts, baked in a rich tomato sauce, a Levantine centrepiece.",
      cuisineLabel: "Syrian",
      tips: [
        "Fry or roast the hollowed eggplants first so they turn meltingly soft.",
        "Toast the pine nuts for a sweet, buttery crunch in the filling.",
        "Keep the sauce loose enough to surround the eggplants and baste them as they bake.",
      ],
      storageTip:
        "Refrigerate up to 3 days; reheat gently in the sauce. Serve with plain or vermicelli rice.",
      steps: [
        "Fry or roast the hollowed baby eggplants until just tender, then drain.",
        "Make the filling: fry the onion in olive oil, add the minced meat and brown, season with allspice, cinnamon, salt and pepper, then stir in the toasted pine nuts.",
        "Make the sauce: soften the garlic, add the grated tomato and tomato paste, season and simmer a few minutes.",
        "Stuff each eggplant generously with the meat-and-pine-nut filling.",
        "Arrange the stuffed eggplants snugly in a dish and pour the tomato sauce around them.",
        "Cover and bake at 190°C until the eggplants are very soft and the sauce is rich; garnish with extra pine nuts.",
      ],
    },
    de: {
      reason:
        "Sheikh al-Mahshi — 'der Meister der gefüllten Gerichte': zarte Baby-Auberginen, gefüllt mit gewürztem Hackfleisch und Pinienkernen, in reichhaltiger Tomatensauce gebacken, ein levantinisches Prunkstück.",
      cuisineLabel: "Syrisch",
      tips: [
        "Die ausgehöhlten Auberginen zuerst braten oder rösten, damit sie zart schmelzen.",
        "Die Pinienkerne rösten für einen süßen, buttrigen Biss in der Füllung.",
        "Die Sauce locker genug halten, um die Auberginen zu umgeben und beim Backen zu begießen.",
      ],
      storageTip:
        "Bis zu 3 Tage kühlen; sanft in der Sauce erwärmen. Mit einfachem oder Fadennudel-Reis servieren.",
      steps: [
        "Die ausgehöhlten Baby-Auberginen braten oder rösten, bis sie zart sind, dann abtropfen lassen.",
        "Füllung zubereiten: die Zwiebel in Olivenöl braten, das Hackfleisch zugeben und anbräunen, mit Piment, Zimt, Salz und Pfeffer würzen, die gerösteten Pinienkerne unterrühren.",
        "Sauce zubereiten: den Knoblauch anschwitzen, geriebene Tomate und Tomatenmark zugeben, würzen und einige Minuten köcheln.",
        "Jede Aubergine großzügig mit der Hackfleisch-Pinienkern-Füllung füllen.",
        "Die gefüllten Auberginen dicht in eine Form setzen und die Tomatensauce darum gießen.",
        "Zugedeckt bei 190 °C backen, bis die Auberginen sehr weich und die Sauce reichhaltig ist; mit extra Pinienkernen garnieren.",
      ],
    },
    ar: {
      reason:
        "شيخ المحشي — 'سيّد المحاشي': باذنجان صغير طري محشوّ بلحم مفروم متبّل وصنوبر، يُخبز في صلصة طماطم غنية، وهو من روائع المطبخ الشامي.",
      cuisineLabel: "سوري",
      tips: [
        "اقلي أو اشوي الباذنجان المفرّغ أولاً كي يصبح طرياً ذائباً.",
        "حمّصي الصنوبر لقرمشة حلوة زبدية في الحشوة.",
        "أبقي الصلصة خفيفة بما يكفي لتحيط بالباذنجان وترطّبه أثناء الخبز.",
      ],
      storageTip:
        "تُحفظ في الثلاجة حتى 3 أيام؛ أعيدي تسخينها بهدوء في الصلصة. تُقدّم مع أرز أبيض أو بالشعيرية.",
      steps: [
        "اقلي أو اشوي الباذنجان الصغير المفرّغ حتى يطرى، ثم صفّيه.",
        "حضّري الحشوة: اقلي البصل في زيت الزيتون، أضيفي اللحم المفروم وحمّريه، تبّليه بالبهار والقرفة والملح والفلفل، ثم أضيفي الصنوبر المحمّص.",
        "حضّري الصلصة: قلّبي الثوم، أضيفي الطماطم المبشورة ومعجون الطماطم، تبّليها واتركيها تغلي بضع دقائق.",
        "احشي كل حبة باذنجان بسخاء بحشوة اللحم والصنوبر.",
        "رصّي الباذنجان المحشي متلاصقاً في صحن واسكبي صلصة الطماطم حوله.",
        "غطّي واخبزي على 190 درجة حتى يصبح الباذنجان طرياً جداً والصلصة غنية؛ زيّني بمزيد من الصنوبر.",
      ],
    },
    tr: {
      reason:
        "Şeyh el-mahşi — 'dolmaların efendisi': baharatlı kıyma ve çam fıstığıyla doldurulmuş yumuşacık bebek patlıcanlar, zengin bir domates sosunda pişirilir; bir Levanten baş tacı.",
      cuisineLabel: "Suriye",
      tips: [
        "İçi oyulmuş patlıcanları önce kızartın veya közleyin ki erircesine yumuşasınlar.",
        "İç harçta tatlı, tereyağımsı bir çıtırlık için çam fıstığını kavurun.",
        "Sosu patlıcanları çevreleyip pişerken üzerine gezdirilebilecek kadar akışkan tutun.",
      ],
      storageTip:
        "Buzdolabında 3 güne kadar saklayın; sosun içinde hafifçe ısıtın. Sade veya tel şehriyeli pilavla servis edin.",
      steps: [
        "İçi oyulmuş bebek patlıcanları yumuşayana dek kızartın veya közleyin, sonra süzün.",
        "İç harcı yapın: soğanı zeytinyağında kavurun, kıymayı ekleyip kızartın, yenibahar, tarçın, tuz ve biberle tatlandırın, kavrulmuş çam fıstığını karıştırın.",
        "Sosu yapın: sarımsağı soteleyin, rendelenmiş domates ve salçayı ekleyin, tatlandırıp birkaç dakika pişirin.",
        "Her patlıcanı kıyma-çam fıstığı harcıyla bolca doldurun.",
        "Doldurulmuş patlıcanları bir kaba sıkıca dizin ve domates sosunu etrafına dökün.",
        "Kapağı kapatıp 190°C'de patlıcanlar iyice yumuşayana ve sos koyulaşana dek pişirin; fazladan çam fıstığıyla süsleyin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 4,
    baseServingsMax: 6,
    servingLabel: "Serves 4–6 with rice",
    scalingNote:
      "Scale the eggplants and filling together and keep enough tomato sauce to surround them. Season the filling and sauce to taste rather than multiplying the spices, so the dish stays savoury and balanced.",
  },
  defaultRole: "main",
  canServeAsMain: false,
  photo: {
    brief:
      "Baby eggplants stuffed with spiced minced meat and pine nuts, simmered in a rich red tomato sauce in a shallow dish, pine nuts visible on top.",
    platingNotes:
      "Stuffed eggplants arranged in a shallow dish surrounded by tomato sauce; keep the dish centered.",
    culturalAuthenticityNotes:
      "Sheikh al-mahshi is meat-and-pine-nut stuffed baby eggplant in tomato sauce — the Levantine identity, not a yogurt-only or unrelated regional dish.",
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/sheikh-al-mahshi.jpg",
  },
};

const FATTET_HUMMUS: GeneratedRecipe = {
  matchKeys: [
    "fattet hummus",
    "fatteh hummus",
    "fattet hommos",
    "hummus fatteh",
    "فتة حمص",
    "فتّة حمّص",
  ],
  canonicalTitle: "Fattet Hummus",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
  prepMinutes: 30,
  difficulty: "easy",
  servings: 4,
  mealTypes: ["side"],
  mealSlotRole: "side_component",
  mealIntents: ["family_friendly", "budget"],
  proteinCategory: "legume",
  budgetTier: "low",
  suitability: ["everyday_host", "shareable"],
  moods: ["everyday"],
  dietaryTags: ["vegetarian_ok", "contains_dairy"],
  allergens: ["Gluten", "Dairy", "Sesame", "Nuts"],
  mayContain: [],
  allergenDeclared: true,
  ingredientTokens: ["chickpeas", "pita bread", "yogurt", "tahini", "garlic", "pine nuts"],
  pantryIngredients: [
    { canonicalId: "chickpeas", role: "critical", tokens: ["chickpeas"] },
    { canonicalId: "pita", role: "critical", tokens: ["pita", "bread"] },
    { canonicalId: "yogurt", role: "supporting", tokens: ["yogurt"] },
    { canonicalId: "tahini", role: "supporting", tokens: ["tahini"] },
    { canonicalId: "garlic", role: "supporting", tokens: ["garlic"] },
    { canonicalId: "pine-nuts", role: "garnish", tokens: ["pine nuts"] },
  ],
  ingredients: [
    { id: "chickpeas", en: "Chickpeas", de: "Kichererbsen", ar: "حمّص", tr: "Nohut", detailEn: "2 cups, cooked and warm", detailDe: "2 Tassen, gekocht und warm", detailAr: "كوبان، مسلوق ودافئ", detailTr: "2 su bardağı, haşlanmış ve ılık", status: "need" },
    { id: "pita", en: "Pita bread", de: "Pitabrot", ar: "خبز عربي", tr: "Pide/pita ekmeği", detailEn: "2, torn and toasted or fried", detailDe: "2, zerteilt und getoastet oder frittiert", detailAr: "رغيفان، مقطّعان ومحمّصان أو مقليان", detailTr: "2 adet, parçalanıp kızartılmış", status: "need" },
    { id: "yogurt", en: "Plain yogurt", de: "Naturjoghurt", ar: "لبن زبادي", tr: "Sade yoğurt", detailEn: "1.5 cups", detailDe: "1,5 Tassen", detailAr: "كوب ونصف", detailTr: "1,5 su bardağı", status: "need" },
    { id: "tahini", en: "Tahini", de: "Tahin", ar: "طحينة", tr: "Tahin", detailEn: "3 tbsp", detailDe: "3 EL", detailAr: "3 ملاعق كبيرة", detailTr: "3 yemek kaşığı", status: "need" },
    { id: "garlic", en: "Garlic", de: "Knoblauch", ar: "ثوم", tr: "Sarımsak", detailEn: "2 cloves, crushed", detailDe: "2 Zehen, zerdrückt", detailAr: "فصان، مهروسان", detailTr: "2 diş, ezilmiş", status: "need" },
    { id: "lemon", en: "Lemon juice", de: "Zitronensaft", ar: "عصير ليمون", tr: "Limon suyu", detailEn: "2 tbsp", detailDe: "2 EL", detailAr: "ملعقتان كبيرتان", detailTr: "2 yemek kaşığı", status: "need" },
    { id: "pine-nuts", en: "Pine nuts", de: "Pinienkerne", ar: "صنوبر", tr: "Çam fıstığı", detailEn: "3 tbsp, toasted", detailDe: "3 EL, geröstet", detailAr: "3 ملاعق كبيرة، محمّص", detailTr: "3 yemek kaşığı, kavrulmuş", status: "need" },
    { id: "butter", en: "Butter or ghee", de: "Butter oder Ghee", ar: "زبدة أو سمن", tr: "Tereyağı veya sadeyağ", detailEn: "2 tbsp, browned", detailDe: "2 EL, gebräunt", detailAr: "ملعقتان كبيرتان، محمّرة", detailTr: "2 yemek kaşığı, kızartılmış", status: "need" },
    { id: "cumin", en: "Cumin & paprika", de: "Kreuzkümmel & Paprika", ar: "كمون وبابريكا", tr: "Kimyon ve toz biber", detailEn: "1/2 tsp each", detailDe: "je 1/2 TL", detailAr: "نصف ملعقة صغيرة من كلٍّ", detailTr: "her birinden 1/2 tatlı kaşığı", status: "need" },
    { id: "parsley", en: "Parsley", de: "Petersilie", ar: "بقدونس", tr: "Maydanoz", detailEn: "to garnish", detailDe: "zum Garnieren", detailAr: "للتزيين", detailTr: "süslemek için", status: "need" },
    { id: "salt", en: "Salt", de: "Salz", ar: "ملح", tr: "Tuz", detailEn: "to taste", detailDe: "nach Geschmack", detailAr: "حسب الذوق", detailTr: "damak tadına göre", status: "need" },
  ],
  localeCopy: {
    en: {
      reason:
        "Levantine fatteh: layers of crisp toasted pita and warm chickpeas under a garlicky yogurt-tahini sauce, finished with browned butter and toasted pine nuts.",
      cuisineLabel: "Syrian",
      tips: [
        "Assemble just before serving so the toasted bread keeps some crunch under the sauce.",
        "Brown the butter until nutty for the traditional aroma, then pour it over hot.",
        "Reserve a few whole chickpeas and extra pine nuts for the top.",
      ],
      storageTip:
        "Keep the components separate in the fridge and assemble fresh; the sauce holds 2 days but the bread must be toasted just before serving.",
      steps: [
        "Toast or fry the torn pita until crisp and golden.",
        "Warm the chickpeas through in a little of their liquid or water.",
        "Whisk the yogurt with the tahini, crushed garlic, lemon juice and a pinch of salt into a smooth, pourable sauce.",
        "Layer the crisp pita in a wide bowl and top with the warm chickpeas.",
        "Pour the yogurt-tahini sauce over so it covers the chickpeas.",
        "Drizzle with the browned butter, scatter with toasted pine nuts, cumin, paprika and parsley, and serve immediately.",
      ],
    },
    de: {
      reason:
        "Levantinische Fatteh: Schichten aus knusprigem geröstetem Pitabrot und warmen Kichererbsen unter einer knoblauchigen Joghurt-Tahin-Sauce, vollendet mit gebräunter Butter und gerösteten Pinienkernen.",
      cuisineLabel: "Syrisch",
      tips: [
        "Erst kurz vor dem Servieren anrichten, damit das geröstete Brot unter der Sauce knusprig bleibt.",
        "Die Butter nussig bräunen für das typische Aroma und heiß darübergießen.",
        "Einige ganze Kichererbsen und extra Pinienkerne für die Oberfläche zurückbehalten.",
      ],
      storageTip:
        "Die Komponenten getrennt im Kühlschrank aufbewahren und frisch anrichten; die Sauce hält 2 Tage, das Brot aber erst kurz vor dem Servieren rösten.",
      steps: [
        "Das zerteilte Pitabrot knusprig und goldbraun toasten oder frittieren.",
        "Die Kichererbsen in etwas ihrer Flüssigkeit oder Wasser erwärmen.",
        "Den Joghurt mit Tahin, zerdrücktem Knoblauch, Zitronensaft und einer Prise Salz zu einer glatten, gießfähigen Sauce verrühren.",
        "Das knusprige Pita in eine weite Schale schichten und mit den warmen Kichererbsen belegen.",
        "Die Joghurt-Tahin-Sauce darüber gießen, sodass sie die Kichererbsen bedeckt.",
        "Mit der gebräunten Butter beträufeln, mit gerösteten Pinienkernen, Kreuzkümmel, Paprika und Petersilie bestreuen und sofort servieren.",
      ],
    },
    ar: {
      reason:
        "فتّة شامية: طبقات من الخبز المحمّص المقرمش والحمّص الدافئ تحت صلصة لبن وطحينة بالثوم، تُزيَّن بالزبدة المحمّرة والصنوبر المحمّص.",
      cuisineLabel: "سوري",
      tips: [
        "ركّبيها قبل التقديم مباشرة كي يبقى الخبز مقرمشاً بعض الشيء تحت الصلصة.",
        "حمّري الزبدة حتى تصبح بلون بندقي للحصول على النكهة التقليدية ثم اسكبيها ساخنة.",
        "احتفظي ببعض حبات الحمّص الكاملة ومزيد من الصنوبر للوجه.",
      ],
      storageTip:
        "احفظي المكوّنات منفصلة في الثلاجة وركّبيها طازجة؛ تصمد الصلصة يومين لكن يجب تحميص الخبز قبل التقديم مباشرة.",
      steps: [
        "حمّصي أو اقلي الخبز المقطّع حتى يصبح مقرمشاً وذهبياً.",
        "سخّني الحمّص في قليل من مائه أو الماء.",
        "اخفقي اللبن مع الطحينة والثوم المهروس وعصير الليمون ورشة ملح حتى تصبح صلصة ناعمة قابلة للسكب.",
        "رصّي الخبز المقرمش في وعاء واسع وغطّيه بالحمّص الدافئ.",
        "اسكبي صلصة اللبن والطحينة فوقه حتى تغطّي الحمّص.",
        "رشّي الزبدة المحمّرة، وزّعي الصنوبر المحمّص والكمون والبابريكا والبقدونس، وقدّميها فوراً.",
      ],
    },
    tr: {
      reason:
        "Levanten fatteh: çıtır kızarmış pide ve ılık nohut katmanları, sarımsaklı yoğurt-tahin sosunun altında; kızdırılmış tereyağı ve kavrulmuş çam fıstığıyla tamamlanır.",
      cuisineLabel: "Suriye",
      tips: [
        "Ekmek sosun altında biraz çıtır kalsın diye servisten hemen önce birleştirin.",
        "Geleneksel aroma için tereyağını fındıksı kokana dek kızdırıp sıcak dökün.",
        "Üst için birkaç bütün nohut ve fazladan çam fıstığı ayırın.",
      ],
      storageTip:
        "Bileşenleri buzdolabında ayrı tutup taze birleştirin; sos 2 gün dayanır ama ekmek servisten hemen önce kızartılmalı.",
      steps: [
        "Parçalanmış pideyi çıtır ve altın rengi olana dek kızartın.",
        "Nohutu kendi suyunda veya biraz suda ısıtın.",
        "Yoğurdu tahin, ezilmiş sarımsak, limon suyu ve bir tutam tuzla pürüzsüz, dökülebilir bir sos olana dek çırpın.",
        "Çıtır pideyi geniş bir kaseye dizin ve üzerine ılık nohutu koyun.",
        "Yoğurt-tahin sosunu nohutu örtecek şekilde dökün.",
        "Kızdırılmış tereyağını gezdirin, kavrulmuş çam fıstığı, kimyon, toz biber ve maydanozla serpin ve hemen servis edin.",
      ],
    },
  },
  naturalYield: {
    baseServingsMin: 3,
    baseServingsMax: 4,
    servingLabel: "One wide bowl · serves 3–4",
    scalingNote:
      "Scale the chickpeas, bread and yogurt-tahini sauce together. Add garlic and lemon to the sauce gradually to taste, and assemble just before serving so the toasted bread stays crisp.",
  },
  defaultRole: "side",
  canServeAsMain: true,
  photo: {
    brief:
      "A wide bowl of Levantine fattet hummus: toasted pita and chickpeas topped with creamy yogurt-tahini sauce, browned butter, toasted pine nuts, paprika and parsley.",
    platingNotes:
      "Layered fatteh in a wide bowl with pine nuts and paprika on top; keep the bowl centered.",
    culturalAuthenticityNotes:
      "Fattet hummus must show its layered components — crisp pita, chickpeas, yogurt-tahini sauce and pine nuts; dairy, gluten and sesame are declared allergens.",
    focalPointX: 50,
    focalPointY: 45,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    preparedImageUrl: "/assets/dishes/arab/fattet-hummus.jpg",
  },
};

export const ARAB_BATCH_1_GROUP_B: GeneratedRecipe[] = [
  KIBBEH_NAYYEH,
  FRIED_KIBBEH,
  WARAK_ENAB_MEAT,
  SHEIKH_AL_MAHSHI,
  FATTET_HUMMUS,
];
