import type { HTMLAttributes, ReactNode } from "react";
import { PhoneFrame } from "../PhoneFrame";

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  footer?: ReactNode;
};

export function AppShell({ children, footer, className = "", ...props }: AppShellProps) {
  return (
    <PhoneFrame className={className} {...props}>
      <div className="flex h-full w-full min-w-0 flex-col bg-background">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
          <div
            aria-hidden
            className="pointer-events-none shrink-0 bg-background"
            style={{ height: "var(--app-safe-top)" }}
          />
          <div
            className={`relative isolate flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background${footer ? "" : " pb-[var(--app-content-bottom)]"}`}
          >
            {children}
          </div>
        </div>
        {footer ? (
          <div className="w-full shrink-0 bg-background pb-[var(--app-safe-bottom)]">{footer}</div>
        ) : null}
      </div>
    </PhoneFrame>
  );
}
