/**
 * In-memory localStorage for Node validation runs (no browser required).
 * Must never mutate browser `window` — globalThis === window in production.
 */
export function installValidationStorage(): void {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return;
  }

  const map = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => map.clear(),
  };

  // Node/vitest only — browser globalThis is Window and window.window is read-only.
  if (typeof globalThis.window === "undefined") {
    (globalThis as Record<string, unknown>).window = { localStorage };
  }
}
