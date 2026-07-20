import type { MessageKey } from "./types";

const WEEKDAY_KEYS: MessageKey[] = [
  "weekdayMon",
  "weekdayTue",
  "weekdayWed",
  "weekdayThu",
  "weekdayFri",
  "weekdaySat",
  "weekdaySun",
];

export function weekdayLabelKey(dayIndex: number): MessageKey {
  return WEEKDAY_KEYS[dayIndex] ?? "weekdayMon";
}
