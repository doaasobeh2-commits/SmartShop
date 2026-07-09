/**
 * Wrapper for Brain data tied to an anonymous local installation — not a personal identity.
 */

export type InstallationScopedPayload<T> = {
  /** Pseudonymous key for this device install only — never a real-world identity. */
  localInstallationId: string;
  updatedAt: string;
  payload: T;
};

export type ResetLocalBrainOptions = {
  /** When true with all_brain_data, removes and regenerates localInstallationId. */
  resetInstallationId?: boolean;
};
