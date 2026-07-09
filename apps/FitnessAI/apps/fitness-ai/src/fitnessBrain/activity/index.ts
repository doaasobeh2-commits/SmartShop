export type {
  ActivityIntensity,
  UiActivityCategoryId,
  ActivityLogEntry,
  SaveActivityLogInput,
  TodayActivitySummary,
  ActivityLearningSnapshot,
} from "./types";

export {
  UI_ACTIVITY_CATEGORIES,
  getCatalogActivities,
  searchCatalogActivities,
  groupActivitiesByCategory,
  getCatalogActivity,
  resolveUiCategory,
  type CatalogActivity,
  type UiActivityCategory,
} from "./activityCatalog";

export { buildActivityLogEntry, sanitizeActivityNote } from "./activityLogEngine";

export {
  ACTIVITY_LOGS_STORAGE_KEY,
  getActivityLogs,
  getRecentActivityLogs,
  getTodayActivitySummary,
  getLastActivityLog,
  shouldOfferQuickRepeat,
  saveActivityLog,
  repeatLastActivityLog,
} from "./activityLogStorage";

export { computeActivityLearning } from "./activityLearningEngine";

export { ACTIVITY_LOG_STRINGS } from "./i18n/strings";
