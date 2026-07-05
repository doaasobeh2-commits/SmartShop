import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@smart-shop/ecosystem/providers";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
