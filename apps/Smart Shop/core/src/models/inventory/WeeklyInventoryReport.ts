import type { HiddenInventoryItem } from "./HiddenInventoryItem";

export type WeeklyInventoryReportSection<T> = {
  items: T[];
  summary: string;
};

/**
 * Future weekly inventory intelligence report.
 * Hidden until Recipe AI and inventory surfaces are enabled.
 */
export type WeeklyInventoryReport = {
  id: string;
  familyId: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  bought: WeeklyInventoryReportSection<HiddenInventoryItem>;
  consumed: WeeklyInventoryReportSection<HiddenInventoryItem>;
  remaining: WeeklyInventoryReportSection<HiddenInventoryItem>;
  closeToExpiration: WeeklyInventoryReportSection<HiddenInventoryItem>;
  wasted: WeeklyInventoryReportSection<HiddenInventoryItem>;
  buyNext: WeeklyInventoryReportSection<HiddenInventoryItem>;
};
