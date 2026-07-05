import type {
  HouseholdSetupSnapshot,
  WeeklyHouseholdPlan,
  PlanLine,
  BasketLineView,
  PurchaseLine,
  HouseholdTimelineEvent,
  HouseholdMemory,
  HouseholdKnowledge,
  HiddenInventoryProjection,
} from "@smart-shop/core";
import { normalizeHouseholdSetup, emptyInventoryProjection } from "@smart-shop/core";
import { normalizeSessionUser } from "../auth/adminAccess";

const STORAGE_KEYS = {
  session: "smartshop.session",
  household: "smartshop.household",
  setupCompleted: "smartshop.setupCompleted",
  weeklyPlan: "smartshop.weeklyPlan",
  timeline: "smartshop.timeline",
  memory: "smartshop.memory",
  knowledge: "smartshop.knowledge",
  basket: "smartshop.basket",
  completedTrip: "smartshop.completedTrip",
  inventory: "smartshop.inventory",
  lastEmail: "smartshop.lastEmail",
} as const;

export type SessionUser = {
  firstName: string;
  lastName: string;
  email: string;
};

export type SessionState = {
  isAuthenticated: boolean;
  user: SessionUser | null;
  householdSetupCompleted: boolean;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadSession(): SessionState {
  const stored = readJson<Partial<SessionState>>(STORAGE_KEYS.session, {});
  const user = stored.user ? normalizeSessionUser(stored.user) : null;
  return {
    isAuthenticated: stored.isAuthenticated ?? false,
    user,
    householdSetupCompleted:
      stored.householdSetupCompleted ??
      readJson<boolean>(STORAGE_KEYS.setupCompleted, false),
  };
}

export function saveSession(session: SessionState): void {
  const normalized: SessionState = {
    ...session,
    user: session.user ? normalizeSessionUser(session.user) : null,
  };
  writeJson(STORAGE_KEYS.session, normalized);
  writeJson(STORAGE_KEYS.setupCompleted, normalized.householdSetupCompleted);
}

/** Clears login session but keeps household setup and app data. */
export function clearLoginSession(): void {
  const setupCompleted = readJson<boolean>(STORAGE_KEYS.setupCompleted, false);
  saveSession({
    isAuthenticated: false,
    user: null,
    householdSetupCompleted: setupCompleted,
  });
}

export function loadSetupCompleted(): boolean {
  return readJson<boolean>(STORAGE_KEYS.setupCompleted, false);
}

export function loadLastLoginEmail(): string {
  return readJson<string>(STORAGE_KEYS.lastEmail, "");
}

export function saveLastLoginEmail(email: string): void {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return;
  }
  writeJson(STORAGE_KEYS.lastEmail, trimmed);
}

export function loadHouseholdSetup(): HouseholdSetupSnapshot | null {
  const stored = readJson<HouseholdSetupSnapshot | null>(STORAGE_KEYS.household, null);
  if (!stored) {
    return null;
  }
  return normalizeHouseholdSetup(stored);
}

export function saveHouseholdSetup(setup: HouseholdSetupSnapshot): void {
  writeJson(STORAGE_KEYS.household, setup);
}

export function loadWeeklyPlan(): WeeklyHouseholdPlan | null {
  return readJson<WeeklyHouseholdPlan | null>(STORAGE_KEYS.weeklyPlan, null);
}

export function saveWeeklyPlan(plan: WeeklyHouseholdPlan): void {
  writeJson(STORAGE_KEYS.weeklyPlan, plan);
}

export function loadBasket(): BasketLineView[] {
  return readJson<BasketLineView[]>(STORAGE_KEYS.basket, []);
}

export function saveBasket(lines: BasketLineView[]): void {
  writeJson(STORAGE_KEYS.basket, lines);
}

export function loadCompletedTrip(): PurchaseLine[] {
  return readJson<PurchaseLine[]>(STORAGE_KEYS.completedTrip, []);
}

export function saveCompletedTrip(lines: PurchaseLine[]): void {
  writeJson(STORAGE_KEYS.completedTrip, lines);
}

export function appendTimelineEvent(event: HouseholdTimelineEvent): void {
  const events = readJson<HouseholdTimelineEvent[]>(STORAGE_KEYS.timeline, []);
  events.push(event);
  writeJson(STORAGE_KEYS.timeline, events);
}

export function loadTimelineEvents(): HouseholdTimelineEvent[] {
  return readJson<HouseholdTimelineEvent[]>(STORAGE_KEYS.timeline, []);
}

export function loadMemory(householdId: string): HouseholdMemory {
  const all = readJson<Record<string, HouseholdMemory>>(STORAGE_KEYS.memory, {});
  return (
    all[householdId] ?? {
      householdId,
      entries: [],
    }
  );
}

export function saveMemory(memory: HouseholdMemory): void {
  const all = readJson<Record<string, HouseholdMemory>>(STORAGE_KEYS.memory, {});
  all[memory.householdId] = memory;
  writeJson(STORAGE_KEYS.memory, all);
}

export function loadKnowledge(householdId: string): HouseholdKnowledge {
  const all = readJson<Record<string, HouseholdKnowledge>>(STORAGE_KEYS.knowledge, {});
  return (
    all[householdId] ?? {
      householdId,
      schemaVersion: 1,
      facts: [],
    }
  );
}

export function saveKnowledge(knowledge: HouseholdKnowledge): void {
  const all = readJson<Record<string, HouseholdKnowledge>>(STORAGE_KEYS.knowledge, {});
  all[knowledge.householdId] = knowledge;
  writeJson(STORAGE_KEYS.knowledge, all);
}

export function loadInventoryProjection(householdId: string): HiddenInventoryProjection {
  const all = readJson<Record<string, HiddenInventoryProjection>>(STORAGE_KEYS.inventory, {});
  return all[householdId] ?? emptyInventoryProjection(householdId);
}

export function saveInventoryProjection(projection: HiddenInventoryProjection): void {
  const all = readJson<Record<string, HiddenInventoryProjection>>(STORAGE_KEYS.inventory, {});
  all[projection.householdId] = projection;
  writeJson(STORAGE_KEYS.inventory, all);
}

export const HOUSEHOLD_ID = "household-local";

export type { PlanLine, BasketLineView, PurchaseLine, WeeklyHouseholdPlan };
