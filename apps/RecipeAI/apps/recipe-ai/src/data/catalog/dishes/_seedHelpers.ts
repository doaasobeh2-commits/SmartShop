import type { DishSeed } from "../buildDish";

/** Compact 3-ingredient starter for catalog expansion. */
export function quickIngredients(
  a: DishSeed["ingredients"][number],
  b: DishSeed["ingredients"][number],
  c: DishSeed["ingredients"][number],
): DishSeed["ingredients"] {
  return [a, b, c];
}

export function ing(
  id: string,
  en: string,
  de: string,
  ar: string,
  tr: string,
  detail = "1",
  status: "have" | "need" = "need",
): DishSeed["ingredients"][number] {
  return {
    id,
    en,
    de,
    ar,
    tr,
    detailEn: detail,
    detailDe: detail,
    detailAr: detail,
    detailTr: detail,
    status,
  };
}

export function bundle(
  reason: [string, string, string, string],
  reasonGuests: [string, string, string, string],
  cuisineLabel: [string, string, string, string],
  stepsEn: string[],
  stepsDe: string[],
  stepsAr: string[],
  stepsTr: string[],
  tip: [string, string, string, string],
  storage: [string, string, string, string],
): Pick<DishSeed, "en" | "de" | "ar" | "tr"> {
  return {
    en: {
      reason: reason[0],
      reasonGuests: reasonGuests[0],
      cuisineLabel: cuisineLabel[0],
      tips: [tip[0]],
      storageTip: storage[0],
      steps: stepsEn,
    },
    de: {
      reason: reason[1],
      reasonGuests: reasonGuests[1],
      cuisineLabel: cuisineLabel[1],
      tips: [tip[1]],
      storageTip: storage[1],
      steps: stepsDe,
    },
    ar: {
      reason: reason[2],
      reasonGuests: reasonGuests[2],
      cuisineLabel: cuisineLabel[2],
      tips: [tip[2]],
      storageTip: storage[2],
      steps: stepsAr,
    },
    tr: {
      reason: reason[3],
      reasonGuests: reasonGuests[3],
      cuisineLabel: cuisineLabel[3],
      tips: [tip[3]],
      storageTip: storage[3],
      steps: stepsTr,
    },
  };
}
