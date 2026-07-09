/**
 * Anonymous local installation identity.
 *
 * - Identifies only this app installation on this device — not a real-world person.
 * - Must never be combined with name, email, phone, address, or exact location.
 * - The user can delete it via resetLocalBrainData({ resetInstallationId: true }).
 * - Future backend sync may use it only as a pseudonymous key, and only after consent.
 */

import { storage } from "../../data/storage/localStorageAdapter";

export const LOCAL_INSTALLATION_ID_KEY = "brain:localInstallationId";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isValidInstallationId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Creates a new random UUID and persists it as the local installation identity.
 * Does not include any personal data — random identifier only.
 */
export function generateLocalInstallationId(): string {
  const localInstallationId = createUuid();
  storage.set(LOCAL_INSTALLATION_ID_KEY, localInstallationId);
  return localInstallationId;
}

/**
 * Returns the persisted installation ID, creating one on first app use.
 */
export function getLocalInstallationId(): string {
  const stored = storage.get<string>(LOCAL_INSTALLATION_ID_KEY);
  if (isValidInstallationId(stored)) return stored;
  return generateLocalInstallationId();
}

/** Ensures an installation ID exists — safe to call on app start. */
export function ensureLocalInstallationId(): string {
  return getLocalInstallationId();
}

/**
 * Removes the current installation ID. Next getLocalInstallationId() creates a new one.
 * Brain-scoped data from the previous ID should be cleared separately.
 */
export function clearLocalInstallationId(): void {
  storage.remove(LOCAL_INSTALLATION_ID_KEY);
}

/**
 * Clears and regenerates the installation ID — use only with explicit user reset.
 */
export function resetLocalInstallationId(): string {
  clearLocalInstallationId();
  return generateLocalInstallationId();
}

export function readStoredInstallationId(): string | null {
  const stored = storage.get<string>(LOCAL_INSTALLATION_ID_KEY);
  return isValidInstallationId(stored) ? stored : null;
}
