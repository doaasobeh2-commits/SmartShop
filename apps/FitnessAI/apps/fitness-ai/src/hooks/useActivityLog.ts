import { useCallback, useMemo, useState } from "react";
import {
  getLastActivityLog,
  getTodayActivitySummary,
  repeatLastActivityLog,
  saveActivityLog,
  shouldOfferQuickRepeat,
} from "../fitnessBrain/activity";
import type { SaveActivityLogInput } from "../fitnessBrain/activity";
import { getCatalogActivity } from "../fitnessBrain/activity/activityCatalog";
import { grantConsent } from "../fitnessBrain/privacy";
import { requestBrainRefresh } from "./useFitnessBrain";

type UseActivityLogOptions = {
  weightKg?: number;
};

export function useActivityLog(options: UseActivityLogOptions = {}) {
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const todaySummary = useMemo(() => getTodayActivitySummary(), [lastSavedAt]);
  const canQuickRepeat = useMemo(() => shouldOfferQuickRepeat(), [lastSavedAt]);
  const lastLog = useMemo(() => getLastActivityLog(), [lastSavedAt]);

  const logActivity = useCallback(
    (input: Omit<SaveActivityLogInput, "weightKg">) => {
      grantConsent("behavior_tracking");
      const entry = saveActivityLog({ ...input, weightKg: options.weightKg });
      if (entry) {
        setLastSavedAt(Date.now());
        requestBrainRefresh();
      }
      return entry;
    },
    [options.weightKg],
  );

  const repeatLast = useCallback(() => {
    grantConsent("behavior_tracking");
    const entry = repeatLastActivityLog(options.weightKg);
    if (entry) {
      setLastSavedAt(Date.now());
      requestBrainRefresh();
    }
    return entry;
  }, [options.weightKg]);

  const lastActivityLabel = lastLog
    ? getCatalogActivity(lastLog.activityId)?.labelDe ?? lastLog.activityId
    : null;

  return {
    logActivity,
    repeatLast,
    canQuickRepeat,
    todaySummary,
    lastLog,
    lastActivityLabel,
    lastSavedAt,
  };
}
