import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminUiContextValue = {
  notice: string | null;
  showNotice: (message: string) => void;
  clearNotice: () => void;
};

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<string | null>(null);

  const clearNotice = useCallback(() => setNotice(null), []);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  const value = useMemo(
    () => ({ notice, showNotice, clearNotice }),
    [notice, showNotice, clearNotice],
  );

  return (
    <AdminUiContext.Provider value={value}>{children}</AdminUiContext.Provider>
  );
}

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) {
    throw new Error("useAdminUi must be used within AdminUiProvider");
  }
  return ctx;
}
