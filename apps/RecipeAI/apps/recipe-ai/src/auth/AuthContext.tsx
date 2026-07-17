import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "../api/client";
import {
  fetchMe,
  hasActiveAppEnrollment,
  loginUser,
  logoutUser,
  registerUser,
  type AuthUser,
  type EnrollmentSummary,
} from "../api/coreApi";

type AuthStatus = "loading" | "anonymous" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  householdId: string | null;
  memberId: string | null;
  memberRole: string | null;
  enrollments: EnrollmentSummary[];
  hasHousehold: boolean;
  recipeEnabled: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    displayName: string;
    dateOfBirth?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const me = await fetchMe();
      setUser(me.user);
      setHouseholdId(me.householdId);
      setMemberId(me.memberId);
      setMemberRole(me.memberRole);
      setEnrollments(me.enrollments ?? []);
      setStatus("authenticated");
    } catch (err) {
      setUser(null);
      setHouseholdId(null);
      setMemberId(null);
      setMemberRole(null);
      setEnrollments([]);
      if (err instanceof ApiError && err.status === 401) {
        setStatus("anonymous");
        return;
      }
      setStatus("anonymous");
      setError("UNABLE_TO_REACH");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await loginUser({ email, password });
      await refresh();
    },
    [refresh],
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      displayName: string;
      dateOfBirth?: string;
    }) => {
      await registerUser(input);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setHouseholdId(null);
      setMemberId(null);
      setMemberRole(null);
      setEnrollments([]);
      setStatus("anonymous");
    }
  }, []);

  const hasHousehold = Boolean(householdId && memberId);
  const recipeEnabled = hasActiveAppEnrollment(enrollments, "recipe");

  const value = useMemo(
    () => ({
      status,
      user,
      householdId,
      memberId,
      memberRole,
      enrollments,
      hasHousehold,
      recipeEnabled,
      error,
      refresh,
      login,
      register,
      logout,
    }),
    [
      status,
      user,
      householdId,
      memberId,
      memberRole,
      enrollments,
      hasHousehold,
      recipeEnabled,
      error,
      refresh,
      login,
      register,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
