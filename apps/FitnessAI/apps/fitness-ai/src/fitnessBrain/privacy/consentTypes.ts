/**
 * Consent types — architecture for future privacy UX.
 * Records are stored locally until a backend exists.
 */

export type PrivacyLocale = "de" | "en" | "ar" | "tr" | "uk" | "fa";

/** Scopes that may require explicit user consent before storage. */
export type ConsentScope =
  | "core_profile"
  | "lifestyle_setup"
  | "behavior_tracking"
  | "food_preferences"
  | "optional_sleep_logging";

export type ConsentRecord = {
  scope: ConsentScope;
  granted: boolean;
  grantedAt: string | null;
  policyVersion: string;
};

export type PrivacyPolicyRef = {
  version: string;
  lastUpdated: string;
  /** Future URL or in-app route — not wired in UI yet. */
  documentId: string;
};

export type DataExportFormat = "json";

export type DataExportRequest = {
  format: DataExportFormat;
  requestedAt: string;
  /** Brain-managed storage keys included in export. */
  includeKeys: string[];
};

export type DataExportBundle = {
  exportedAt: string;
  policyVersion: string;
  /** Pseudonymous local install key — not a personal identity. */
  localInstallationId: string;
  consent: ConsentRecord[];
  lifestyle: unknown;
  behaviorLogs: unknown;
  activityLogs?: unknown;
  userCustomFoods?: unknown;
  meta: {
    purpose: string;
    note: string;
  };
};

export type DataDeletionScope =
  | "all_brain_data"
  | "lifestyle_only"
  | "behavior_logs_only"
  | "consent_only";

export type DataDeletionRequest = {
  scope: DataDeletionScope;
  requestedAt: string;
  reason?: string;
};

export type LocalDataResetScope = DataDeletionScope;

export const CONSENT_STORAGE_KEY = "privacy:consent-records";
export const CURRENT_POLICY_VERSION = "2026-01";

export const DEFAULT_CONSENT_STATE: ConsentRecord[] = [
  {
    scope: "core_profile",
    granted: true,
    grantedAt: null,
    policyVersion: CURRENT_POLICY_VERSION,
  },
  {
    scope: "lifestyle_setup",
    granted: false,
    grantedAt: null,
    policyVersion: CURRENT_POLICY_VERSION,
  },
  {
    scope: "behavior_tracking",
    granted: true,
    grantedAt: null,
    policyVersion: CURRENT_POLICY_VERSION,
  },
  {
    scope: "food_preferences",
    granted: false,
    grantedAt: null,
    policyVersion: CURRENT_POLICY_VERSION,
  },
  {
    scope: "optional_sleep_logging",
    granted: false,
    grantedAt: null,
    policyVersion: CURRENT_POLICY_VERSION,
  },
];

export type ConsentStore = {
  load: () => ConsentRecord[];
  save: (records: ConsentRecord[]) => void;
  grant: (scope: ConsentScope) => ConsentRecord[];
};
