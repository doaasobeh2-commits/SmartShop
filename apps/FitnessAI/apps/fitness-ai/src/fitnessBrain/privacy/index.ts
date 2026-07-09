export type {
  ConsentScope,
  ConsentRecord,
  ConsentStore,
  PrivacyPolicyRef,
  PrivacyLocale,
  DataExportFormat,
  DataExportRequest,
  DataExportBundle,
  DataDeletionScope,
  DataDeletionRequest,
  LocalDataResetScope,
} from "./consentTypes";

export {
  CONSENT_STORAGE_KEY,
  CURRENT_POLICY_VERSION,
  DEFAULT_CONSENT_STATE,
} from "./consentTypes";

export {
  PROHIBITED_PROFILE_TOPICS,
  PROHIBITED_FIELD_PATTERNS,
  SAFETY_ONLY_TOPICS,
  FORBIDDEN_PII_FIELDS,
  ALLOWED_LIFESTYLE_FIELDS,
  ALLOWED_HEALTH_SIGNALS,
  ALLOWED_PROFILE_FIELDS,
  fieldNameIsProhibited,
  isSafetyOnlyTopic,
} from "./privacyRules";

export type { InstallationScopedPayload, ResetLocalBrainOptions } from "./installationScopedTypes";

export {
  LOCAL_INSTALLATION_ID_KEY,
  generateLocalInstallationId,
  getLocalInstallationId,
  ensureLocalInstallationId,
  clearLocalInstallationId,
  resetLocalInstallationId,
  readStoredInstallationId,
} from "./localInstallationId";

export {
  readInstallationScoped,
  writeInstallationScoped,
  removeInstallationScoped,
  readInstallationScopedRaw,
} from "./brainInstallationStorage";

export {
  isAllowedLifestyleField,
  isAllowedProfileField,
  shouldStoreHealthSignal,
  getDataPurpose,
  getPrivacyDisclaimer,
  sanitizeLifestylePatch,
  loadConsentRecords,
  saveConsentRecords,
  grantConsent,
  hasConsent,
  exportBrainData,
  deleteBrainData,
  resetLocalBrainData,
  listBrainStorageKeys,
} from "./dataMinimization";
