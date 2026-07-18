/**
 * Fail-closed production security gates.
 * Throws operator-facing errors for process startup only — never send these
 * messages over HTTP.
 */

export type ProductionSecurityEnv = {
  NODE_ENV: "development" | "test" | "production";
  COOKIE_SECURE: boolean;
};

export type DevTokenExposureCheck = () => boolean;

/**
 * When NODE_ENV is production:
 * - COOKIE_SECURE must be true
 * - development-only plaintext token exposure must be disabled
 */
export function assertProductionSecurityConfig(
  env: ProductionSecurityEnv,
  isDevTokenExposureEnabled: DevTokenExposureCheck,
): void {
  if (env.NODE_ENV !== "production") return;

  if (!env.COOKIE_SECURE) {
    throw new Error(
      [
        "Refusing to start: insecure production configuration.",
        "NODE_ENV=production requires COOKIE_SECURE=true.",
        "Set COOKIE_SECURE=true in the host secret store and restart.",
      ].join(" "),
    );
  }

  if (isDevTokenExposureEnabled()) {
    throw new Error(
      [
        "Refusing to start: insecure production configuration.",
        "developmentOnlyToken exposure must be disabled when NODE_ENV=production.",
        "Check isDevTokenExposureEnabled() / NODE_ENV wiring before restart.",
      ].join(" "),
    );
  }
}
