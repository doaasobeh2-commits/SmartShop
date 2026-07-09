import type { Lang } from "@fitness-ai/core/types";
import type { ActivityLevel, UserGoal } from "../domain/models";

const GOALS: Record<UserGoal, Record<Lang, string>> = {
  lose: { en: "Lose weight", de: "Abnehmen", ar: "خسارة الوزن" },
  muscle: { en: "Build muscle", de: "Muskeln aufbauen", ar: "بناء العضلات" },
  fit: { en: "Get fit", de: "Fit werden", ar: "الحصول على لياقة" },
  health: { en: "Feel healthier", de: "Gesünder fühlen", ar: "صحة أفضل" },
  sport: { en: "Sport performance", de: "Sportleistung", ar: "أداء رياضي" },
  stress: { en: "Reduce stress", de: "Stress reduzieren", ar: "تقليل التوتر" },
};

const ACTIVITY: Record<ActivityLevel, Record<Lang, string>> = {
  sed: { en: "Mostly sedentary", de: "Wenig aktiv", ar: "قليل الحركة" },
  light: { en: "Light activity", de: "Leicht aktiv", ar: "نشاط خفيف" },
  mod: { en: "Moderately active", de: "Mäßig aktiv", ar: "نشاط معتدل" },
  active: { en: "Very active", de: "Sehr aktiv", ar: "نشيط جداً" },
  athlete: { en: "Athlete", de: "Athlet", ar: "رياضي محترف" },
};

export function goalLabel(goal: UserGoal, lang: Lang): string {
  return GOALS[goal]?.[lang] ?? GOALS.lose[lang];
}

export function activityLabel(level: ActivityLevel, lang: Lang): string {
  return ACTIVITY[level]?.[lang] ?? ACTIVITY.mod[lang];
}
