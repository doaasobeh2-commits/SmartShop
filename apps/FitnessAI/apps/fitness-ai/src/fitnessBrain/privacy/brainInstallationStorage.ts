/**
 * Installation-scoped Brain storage.
 * Every persisted Brain record is tagged with localInstallationId internally.
 */

import type { InstallationScopedPayload } from "./installationScopedTypes";
import { getLocalInstallationId } from "./localInstallationId";
import { storage } from "../../data/storage/localStorageAdapter";

function isScopedPayload<T>(value: unknown): value is InstallationScopedPayload<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "localInstallationId" in value &&
    "payload" in value
  );
}

/** Reads Brain data for the current installation; ignores orphaned records. */
export function readInstallationScoped<T>(storageKey: string): T | null {
  const currentId = getLocalInstallationId();
  const raw = storage.get<InstallationScopedPayload<T> | T>(storageKey);
  if (raw === null) return null;

  if (isScopedPayload<T>(raw)) {
    if (raw.localInstallationId !== currentId) return null;
    return raw.payload;
  }

  // Legacy unscoped record — still readable until next write migrates it.
  return raw as T;
}

/** Persists Brain data under the current localInstallationId. */
export function writeInstallationScoped<T>(storageKey: string, payload: T): void {
  const record: InstallationScopedPayload<T> = {
    localInstallationId: getLocalInstallationId(),
    updatedAt: new Date().toISOString(),
    payload,
  };
  storage.set(storageKey, record);
}

export function removeInstallationScoped(storageKey: string): void {
  storage.remove(storageKey);
}

/** Raw read for export — includes scope metadata when present. */
export function readInstallationScopedRaw(storageKey: string): unknown {
  return storage.get(storageKey);
}
