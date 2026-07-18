import type { MealStyleId, ShareYumLocale } from "./ids";

export type MealStyleDefinition = {
  id: MealStyleId;
  localizations: Record<ShareYumLocale, { name: string; description: string }>;
};

export const MEAL_STYLES: readonly MealStyleDefinition[] = [
  {
    id: "protein_bowl",
    localizations: {
      en: { name: "Protein bowl", description: "Balanced bowl with focused protein." },
      de: { name: "Protein-Bowl", description: "Ausgewogene Schüssel mit Protein-Fokus." },
      ar: { name: "وعاء بروتين", description: "وجبة متوازنة غنية بالبروتين." },
      tr: { name: "Protein kasesi", description: "Protein odaklı dengeli kase." },
    },
  },
  {
    id: "balanced_plate",
    localizations: {
      en: { name: "Balanced plate", description: "Even mix of protein, starch, and vegetables." },
      de: { name: "Ausgewogener Teller", description: "Ausgewogene Mischung aus Protein, Beilage und Gemüse." },
      ar: { name: "طبق متوازن", description: "مزيج متوازن من البروتين والنشويات والخضار." },
      tr: { name: "Dengeli tabak", description: "Protein, nişasta ve sebze dengesi." },
    },
  },
  {
    id: "high_protein",
    localizations: {
      en: { name: "High protein", description: "Higher protein emphasis for active households." },
      de: { name: "High Protein", description: "Höherer Proteinfokus für aktive Haushalte." },
      ar: { name: "غني بالبروتين", description: "تركيز أعلى على البروتين." },
      tr: { name: "Yüksek protein", description: "Aktif haneler için yüksek protein." },
    },
  },
  {
    id: "lighter_meal",
    localizations: {
      en: { name: "Lighter meal", description: "Lower heaviness; good for lighter evenings." },
      de: { name: "Leichte Mahlzeit", description: "Weniger schwer; gut für leichte Abende." },
      ar: { name: "وجبة خفيفة", description: "أخف للمساءات الهادئة." },
      tr: { name: "Hafif öğün", description: "Daha hafif akşamlar için." },
    },
  },
  {
    id: "one_pot",
    localizations: {
      en: { name: "One pot", description: "Minimal cleanup; single-vessel cooking." },
      de: { name: "One Pot", description: "Wenig Abwasch; alles in einem Topf." },
      ar: { name: "طبخ في قدر واحد", description: "تنظيف بسيط؛ طبخ في وعاء واحد." },
      tr: { name: "Tek tencere", description: "Az bulaşık; tek kap pişirme." },
    },
  },
  {
    id: "soup_meal",
    localizations: {
      en: { name: "Soup meal", description: "Soups and brothy household mains." },
      de: { name: "Suppenmahlzeit", description: "Suppen und brotige Hauptgerichte." },
      ar: { name: "وجبة حساء", description: "شوربات وأطباق منزلية دافئة." },
      tr: { name: "Çorba öğünü", description: "Çorbalar ve ev yemekleri." },
    },
  },
  {
    id: "salad_meal",
    localizations: {
      en: { name: "Salad meal", description: "Salad-forward meals with substance." },
      de: { name: "Salatgericht", description: "Salatbetonte Mahlzeiten mit Substanz." },
      ar: { name: "وجبة سلطة", description: "وجبات سالطة مشبعة." },
      tr: { name: "Salata öğünü", description: "Doyurucu salata odaklı yemekler." },
    },
  },
] as const;
