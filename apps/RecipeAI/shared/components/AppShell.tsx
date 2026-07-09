import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto flex w-full flex-col overflow-hidden shadow-2xl"
      style={{
        maxWidth: "var(--app-max-width)",
        height: "var(--app-height)",
        background: "var(--background)",
      }}
    >
      {children}
    </div>
  );
}
