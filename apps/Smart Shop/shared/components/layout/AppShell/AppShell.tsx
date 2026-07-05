import type { HTMLAttributes, ReactNode } from "react";
import { PhoneFrame } from "../PhoneFrame";

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  footer?: ReactNode;
};

export function AppShell({ children, footer, className = "", ...props }: AppShellProps) {
  return (
    <PhoneFrame className={className} {...props}>
      <div className="flex h-full w-full min-w-0 flex-col">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden pt-[var(--app-safe-top)]">
          {children}
        </div>
        {footer ? (
          <div className="w-full shrink-0 pb-[var(--app-safe-bottom)]">{footer}</div>
        ) : null}
      </div>
    </PhoneFrame>
  );
}
