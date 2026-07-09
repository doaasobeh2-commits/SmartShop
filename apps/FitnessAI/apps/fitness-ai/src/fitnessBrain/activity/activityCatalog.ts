/**
 * UI-facing activity catalog — grouped categories, search, icons.
 * Metadata source: lifestyle/activityLibrary.
 */

import {
  ACTIVITY_LIBRARY,
  getActivityById,
  type ActivityDefinition,
} from "../lifestyle/activityLibrary";
import { activityLabelDe } from "../lifestyle/i18n/setupStrings";
import type { UiActivityCategoryId } from "./types";

export type UiActivityCategory = {
  id: UiActivityCategoryId;
  labelDe: string;
  icon: string;
};

export const UI_ACTIVITY_CATEGORIES: UiActivityCategory[] = [
  { id: "strength", labelDe: "Krafttraining", icon: "🏋️" },
  { id: "cardio", labelDe: "Cardio", icon: "❤️" },
  { id: "cycling", labelDe: "Radfahren", icon: "🚴" },
  { id: "swimming", labelDe: "Schwimmen", icon: "🏊" },
  { id: "walking", labelDe: "Gehen", icon: "🚶" },
  { id: "running", labelDe: "Laufen", icon: "🏃" },
  { id: "team_sports", labelDe: "Teamsport", icon: "⚽" },
  { id: "combat_sports", labelDe: "Kampfsport", icon: "🥊" },
  { id: "yoga_mobility", labelDe: "Yoga & Mobility", icon: "🧘" },
  { id: "outdoor", labelDe: "Outdoor", icon: "⛰️" },
  { id: "other", labelDe: "Sonstiges", icon: "✨" },
];

const ACTIVITY_UI_CATEGORY: Record<string, UiActivityCategoryId> = {
  strength_training: "strength",
  running: "running",
  walking: "walking",
  swimming: "swimming",
  cycling: "cycling",
  rowing: "cardio",
  football: "team_sports",
  basketball: "team_sports",
  tennis: "team_sports",
  badminton: "team_sports",
  volleyball: "team_sports",
  yoga: "yoga_mobility",
  pilates: "yoga_mobility",
  stretching: "yoga_mobility",
  boxing: "combat_sports",
  kickboxing: "combat_sports",
  mma: "combat_sports",
  judo: "combat_sports",
  hiking: "outdoor",
  climbing: "outdoor",
  dance: "cardio",
};

export type CatalogActivity = ActivityDefinition & {
  uiCategory: UiActivityCategoryId;
  labelDe: string;
  icon: string;
};

function categoryMeta(uiCategory: UiActivityCategoryId): { labelDe: string; icon: string } {
  const cat = UI_ACTIVITY_CATEGORIES.find((c) => c.id === uiCategory);
  return cat ?? { labelDe: "Sonstiges", icon: "✨" };
}

export function resolveUiCategory(activityId: string): UiActivityCategoryId {
  return ACTIVITY_UI_CATEGORY[activityId] ?? "other";
}

export function getCatalogActivities(): CatalogActivity[] {
  return ACTIVITY_LIBRARY.map((activity) => {
    const uiCategory = resolveUiCategory(activity.id);
    const meta = categoryMeta(uiCategory);
    return {
      ...activity,
      uiCategory,
      labelDe: activityLabelDe(activity.id),
      icon: meta.icon,
    };
  });
}

export function searchCatalogActivities(query: string): CatalogActivity[] {
  const q = query.trim().toLowerCase();
  const all = getCatalogActivities();
  if (!q) return all;
  return all.filter(
    (a) =>
      a.labelDe.toLowerCase().includes(q) ||
      a.id.includes(q) ||
      a.uiCategory.includes(q) ||
      UI_ACTIVITY_CATEGORIES.find((c) => c.id === a.uiCategory)?.labelDe.toLowerCase().includes(q),
  );
}

export function groupActivitiesByCategory(
  activities: CatalogActivity[],
): Map<UiActivityCategoryId, CatalogActivity[]> {
  const map = new Map<UiActivityCategoryId, CatalogActivity[]>();
  for (const cat of UI_ACTIVITY_CATEGORIES) {
    map.set(cat.id, []);
  }
  for (const activity of activities) {
    map.get(activity.uiCategory)?.push(activity);
  }
  return map;
}

export function getCatalogActivity(activityId: string): CatalogActivity | undefined {
  const base = getActivityById(activityId);
  if (!base) return undefined;
  const uiCategory = resolveUiCategory(activityId);
  const meta = categoryMeta(uiCategory);
  return {
    ...base,
    uiCategory,
    labelDe: activityLabelDe(activityId),
    icon: meta.icon,
  };
}
