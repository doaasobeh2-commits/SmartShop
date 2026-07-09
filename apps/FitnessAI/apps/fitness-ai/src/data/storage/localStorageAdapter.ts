import type { IStorageAdapter } from "../../domain/interfaces";

const PREFIX = "fitness-ai:";

export function createLocalStorageAdapter(): IStorageAdapter {
  return {
    get<T>(key: string): T | null {
      if (typeof window === "undefined") return null;
      const raw = window.localStorage.getItem(`${PREFIX}${key}`);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    set<T>(key: string, value: T): void {
      window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    },
    remove(key: string): void {
      window.localStorage.removeItem(`${PREFIX}${key}`);
    },
  };
}

export const storage = createLocalStorageAdapter();
