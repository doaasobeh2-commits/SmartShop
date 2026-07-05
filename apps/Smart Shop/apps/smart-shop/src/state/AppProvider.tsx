import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  generateBasketFromPlan,
  generateWeeklyPlan,
  buildPurchaseLines,
  finalizeHouseholdSetup,
  type HouseholdSetupSnapshot,
  DEFAULT_HOUSEHOLD_SETUP,
  normalizeHouseholdSetup,
} from "@smart-shop/core";
import type { ScreenId } from "@smart-shop/core/types";
import {
  loadSession,
  HOUSEHOLD_ID,
  loadBasket,
  loadCompletedTrip,
  loadHouseholdSetup,
  loadWeeklyPlan,
  saveBasket,
  saveCompletedTrip,
  saveHouseholdSetup,
  saveSession,
  saveWeeklyPlan,
  type SessionState,
  type SessionUser,
  type BasketLineView,
  type PlanLine,
  type PurchaseLine,
} from "../state/localStore";
import { completeShoppingTrip } from "../services/tripCompletionService";
import { syncHouseholdSetupToMemory } from "../services/householdSetupService";
import { applyTripSideEffects } from "../services/tripSideEffectsService";

type AppContextValue = {
  session: SessionState;
  householdSetup: HouseholdSetupSnapshot;
  planLines: PlanLine[];
  basketLines: BasketLineView[];
  completedTripLines: PurchaseLine[];
  decisionVersion: number;
  login: (user: SessionUser) => void;
  register: (user: SessionUser) => void;
  logout: () => void;
  completeHouseholdSetup: (setup: HouseholdSetupSnapshot) => void;
  updateHouseholdSetup: (setup: HouseholdSetupSnapshot) => void;
  updateSessionUser: (user: SessionUser) => void;
  updatePlanLines: (lines: PlanLine[]) => void;
  startShoppingFromPlan: () => void;
  prepareCompletedTrip: (purchasedIds: Set<string>) => Promise<void>;
  resolveEntryScreen: () => ScreenId;
};

const AppContext = createContext<AppContextValue | null>(null);

function ensureWeeklyPlan(setup: HouseholdSetupSnapshot): PlanLine[] {
  const existing = loadWeeklyPlan();
  if (existing && existing.householdId === HOUSEHOLD_ID) {
    return existing.lines;
  }
  const plan = generateWeeklyPlan(setup, HOUSEHOLD_ID);
  saveWeeklyPlan(plan);
  return plan.lines;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(() => loadSession());
  const [householdSetup, setHouseholdSetup] = useState<HouseholdSetupSnapshot>(
    () => normalizeHouseholdSetup(loadHouseholdSetup() ?? DEFAULT_HOUSEHOLD_SETUP),
  );
  const [planLines, setPlanLines] = useState<PlanLine[]>(() =>
    ensureWeeklyPlan(loadHouseholdSetup() ?? DEFAULT_HOUSEHOLD_SETUP),
  );
  const [basketLines, setBasketLines] = useState<BasketLineView[]>(() => loadBasket());
  const [completedTripLines, setCompletedTripLines] = useState<PurchaseLine[]>(() =>
    loadCompletedTrip(),
  );
  const [decisionVersion, setDecisionVersion] = useState(0);

  const persistSession = useCallback((next: SessionState) => {
    setSession(next);
    saveSession(next);
  }, []);

  const login = useCallback(
    (user: SessionUser) => {
      const setupCompleted = loadSession().householdSetupCompleted;
      persistSession({
        isAuthenticated: true,
        user,
        householdSetupCompleted: setupCompleted,
      });
    },
    [persistSession],
  );

  const register = useCallback(
    (user: SessionUser) => {
      persistSession({
        isAuthenticated: true,
        user,
        householdSetupCompleted: false,
      });
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    persistSession({
      isAuthenticated: false,
      user: null,
      householdSetupCompleted: false,
    });
  }, [persistSession]);

  const completeHouseholdSetup = useCallback((setup: HouseholdSetupSnapshot) => {
    const finalized = finalizeHouseholdSetup(setup);
    saveHouseholdSetup(finalized);
    setHouseholdSetup(finalized);
    syncHouseholdSetupToMemory(HOUSEHOLD_ID, finalized);
    const plan = generateWeeklyPlan(finalized, HOUSEHOLD_ID);
    saveWeeklyPlan(plan);
    setPlanLines(plan.lines);
    setSession((previous) => {
      const next = { ...previous, householdSetupCompleted: true };
      saveSession(next);
      return next;
    });
    setDecisionVersion((version) => version + 1);
  }, []);

  const updateHouseholdSetup = useCallback((setup: HouseholdSetupSnapshot) => {
    const finalized = finalizeHouseholdSetup(setup);
    saveHouseholdSetup(finalized);
    setHouseholdSetup(finalized);
    syncHouseholdSetupToMemory(HOUSEHOLD_ID, finalized);
    const plan = generateWeeklyPlan(finalized, HOUSEHOLD_ID);
    saveWeeklyPlan(plan);
    setPlanLines(plan.lines);
    setDecisionVersion((version) => version + 1);
  }, []);

  const updateSessionUser = useCallback((user: SessionUser) => {
    setSession((previous) => {
      const next = { ...previous, user };
      saveSession(next);
      return next;
    });
  }, []);

  const updatePlanLines = useCallback((lines: PlanLine[]) => {
    setPlanLines(lines);
    const plan = loadWeeklyPlan();
    if (plan) {
      saveWeeklyPlan({ ...plan, lines });
    }
  }, []);

  const startShoppingFromPlan = useCallback(() => {
    const basket = generateBasketFromPlan(planLines, householdSetup);
    setBasketLines(basket);
    saveBasket(basket);
  }, [planLines, householdSetup]);

  const prepareCompletedTrip = useCallback(
    async (purchasedIds: Set<string>) => {
      const lines = buildPurchaseLines(basketLines, purchasedIds, planLines);
      setCompletedTripLines(lines);
      saveCompletedTrip(lines);

      const purchasedTotal = lines
        .filter((line) => line.purchased)
        .reduce((sum, line) => sum + line.price, 0);
      const storeCount = new Set(
        lines.filter((line) => line.purchased).map((line) => line.storeName),
      ).size;

      await completeShoppingTrip({
        basketId: `basket-${Date.now()}`,
        storeCount: storeCount || 1,
        totalAmount: purchasedTotal,
        currency: "EUR",
        lines,
      });

      applyTripSideEffects(lines);

      const refreshedPlan = generateWeeklyPlan(householdSetup, HOUSEHOLD_ID);
      saveWeeklyPlan(refreshedPlan);
      setPlanLines(refreshedPlan.lines);
      setBasketLines([]);
      saveBasket([]);
      setDecisionVersion((version) => version + 1);
    },
    [basketLines, householdSetup, planLines],
  );

  const resolveEntryScreen = useCallback((): ScreenId => {
    if (!session.isAuthenticated) {
      return "00-welcome";
    }
    if (!session.householdSetupCompleted) {
      return "15-household-wizard";
    }
    return "05-dashboard";
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      householdSetup,
      planLines,
      basketLines,
      completedTripLines,
      decisionVersion,
      login,
      register,
      logout,
      completeHouseholdSetup,
      updateHouseholdSetup,
      updateSessionUser,
      updatePlanLines,
      startShoppingFromPlan,
      prepareCompletedTrip,
      resolveEntryScreen,
    }),
    [
      session,
      householdSetup,
      planLines,
      basketLines,
      completedTripLines,
      decisionVersion,
      login,
      register,
      logout,
      completeHouseholdSetup,
      updateHouseholdSetup,
      updateSessionUser,
      updatePlanLines,
      startShoppingFromPlan,
      prepareCompletedTrip,
      resolveEntryScreen,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
}
