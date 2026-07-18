/** Owner-approved default for controlled cuisine exploration. */
export const DEFAULT_EXPLORATION_WILLINGNESS = 0.3 as const;

/**
 * Fail-closed: recipes with mayContain allergens matching household codes
 * are excluded from safety-sensitive primary recommendations by default.
 */
export const ALLERGEN_MAY_CONTAIN_FAIL_CLOSED = true as const;

/** Language must not be used as a strong proxy for cuisine preference. */
export const LANGUAGE_CUISINE_PRIOR_MAX = 0.05 as const;

/** Cultural/origin priors, when consent-based, remain weak. */
export const CULTURAL_ORIGIN_PRIOR_MAX = 0.15 as const;
