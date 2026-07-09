/** Future analytics pipeline — event batching, privacy-aware exports. */
export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean>;
};

export type AnalyticsService = {
  track(event: AnalyticsEvent): void;
};

export const analyticsService: AnalyticsService = {
  track(_event) {
    // Placeholder — wire to provider later.
  },
};
