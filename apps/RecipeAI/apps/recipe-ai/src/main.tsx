import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminApp } from "./admin/AdminApp";
import { isAdminRecipesRoute } from "./admin/adminRoute";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { AppStateProvider } from "./hooks/AppStateProvider";
import "./index.css";

const mountAdmin = isAdminRecipesRoute(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {mountAdmin ? (
      <AdminApp />
    ) : (
      <AuthProvider>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </AuthProvider>
    )}
  </StrictMode>,
);