/**
 * Brain execution cache — foundation for incremental updates.
 * When only one domain changes (e.g. hydration log), future versions can
 * re-run affected pipeline stages instead of the full Brain.
 */

import { runBrainPipeline } from "../pipeline";
import type {
  FitnessBrainState,
  GenerateFitnessBrainOptions,
  UserDataInput,
} from "../types";

export type BrainChangeDomain =
  | "profile"
  | "lifestyle"
  | "metabolism"
  | "nutrition"
  | "activity"
  | "recovery"
  | "training"
  | "behavior"
  | "decision";

type CacheEntry = {
  state: FitnessBrainState;
  inputFingerprint: string;
  cachedAt: number;
};

let lastCache: CacheEntry | null = null;

function fingerprint(userData: UserDataInput): string {
  return JSON.stringify(userData);
}

/** Returns cached state when input is unchanged — full pipeline otherwise. */
export function runBrainPipelineCached(
  userData: UserDataInput = {},
  options: GenerateFitnessBrainOptions = {},
): FitnessBrainState {
  const fp = fingerprint(userData);
  if (lastCache && lastCache.inputFingerprint === fp) {
    return lastCache.state;
  }
  const { state } = runBrainPipeline(userData, options);
  lastCache = { state, inputFingerprint: fp, cachedAt: Date.now() };
  return state;
}

/**
 * Placeholder for domain-scoped invalidation.
 * Call before re-running pipeline when a specific domain's inputs change.
 */
export function invalidateBrainCache(_domains?: BrainChangeDomain[]): void {
  lastCache = null;
}

export function getBrainCacheSnapshot(): CacheEntry | null {
  return lastCache;
}
