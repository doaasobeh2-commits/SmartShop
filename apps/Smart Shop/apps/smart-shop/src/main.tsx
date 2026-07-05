import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@smart-shop/ecosystem/providers";
import { AppProvider } from "./state/AppProvider";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppProvider>
        <App />
      </AppProvider>
    </AppProviders>
  </StrictMode>,
);
