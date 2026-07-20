import type { AppLocale } from "../i18n/types";



/** Client-safe mirror of A2.2 active cuisine families for onboarding cards. */

export type CuisineOnboardingOption = {

  id: string;

  imageUrl: string;

  displayOrder: number;

  labels: Record<AppLocale, string>;

};



const CUISINE_IMAGE_BASE = "/assets/onboarding";



/** Keep in sync with packages/food-core/src/taxonomy (active families only). */

export const CUISINE_ONBOARDING_OPTIONS: readonly CuisineOnboardingOption[] = [

  {

    id: "arab",

    imageUrl: `${CUISINE_IMAGE_BASE}/cuisine-arab.jpg`,

    displayOrder: 1,

    labels: {

      en: "Arab cuisines",

      de: "Arabische Küchen",

      ar: "المطابخ العربية",

      tr: "Arap mutfakları",

    },

  },

  {

    id: "turkish",

    imageUrl: `${CUISINE_IMAGE_BASE}/cuisine-turkish.jpg`,

    displayOrder: 2,

    labels: {

      en: "Turkish",

      de: "Türkisch",

      ar: "المطبخ التركي",

      tr: "Türk mutfağı",

    },

  },

  {

    id: "central_european",

    imageUrl: `${CUISINE_IMAGE_BASE}/cuisine-central-european.jpg`,

    displayOrder: 3,

    labels: {

      en: "Central European",

      de: "Mitteleuropäisch",

      ar: "المطبخ الأوروبي الوسطى",

      tr: "Orta Avrupa",

    },

  },

  {

    id: "italian",

    imageUrl: `${CUISINE_IMAGE_BASE}/cuisine-italian.jpg`,

    displayOrder: 4,

    labels: {

      en: "Italian",

      de: "Italienisch",

      ar: "المطبخ الإيطالي",

      tr: "İtalyan",

    },

  },

  {

    id: "chinese",

    imageUrl: `${CUISINE_IMAGE_BASE}/cuisine-chinese.jpg`,

    displayOrder: 5,

    labels: {

      en: "Chinese",

      de: "Chinesisch",

      ar: "المطبخ الصيني",

      tr: "Çin",

    },

  },

  {

    id: "indian",

    imageUrl: `${CUISINE_IMAGE_BASE}/cuisine-indian.jpg`,

    displayOrder: 6,

    labels: {

      en: "Indian",

      de: "Indisch",

      ar: "المطبخ الهندي",

      tr: "Hint",

    },

  },

  {

    id: "mexican",

    imageUrl: `${CUISINE_IMAGE_BASE}/cuisine-mexican.jpg`,

    displayOrder: 7,

    labels: {

      en: "Mexican",

      de: "Mexikanisch",

      ar: "المطبخ المكسيكي",

      tr: "Meksika",

    },

  },

];



const LEGACY_CUISINE_ID_MAP: Record<string, string> = {

  arabic: "arab",

  austrian: "central_european",

  german: "central_european",

};



export function normalizeCuisineFamilyId(id: string): string {

  return LEGACY_CUISINE_ID_MAP[id] ?? id;

}



export function getCuisineOnboardingOptions(locale: AppLocale): Array<{

  id: string;

  label: string;

  imageUrl: string;

}> {

  return [...CUISINE_ONBOARDING_OPTIONS]

    .sort((a, b) => a.displayOrder - b.displayOrder)

    .map((option) => ({

      id: option.id,

      label: option.labels[locale],

      imageUrl: option.imageUrl,

    }));

}



export function getCuisineImageUrl(cuisineId: string): string | undefined {

  const normalized = normalizeCuisineFamilyId(cuisineId);

  return CUISINE_ONBOARDING_OPTIONS.find((o) => o.id === normalized)?.imageUrl;

}


