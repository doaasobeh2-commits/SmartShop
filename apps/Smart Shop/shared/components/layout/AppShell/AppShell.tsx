import type { HTMLAttributes, ReactNode } from "react";

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  footer?: ReactNode;
};

export function AppShell({ children, footer, className = "", ...props }: AppShellProps) {
  return (
    <div
      className={`relative mx-auto flex h-[var(--app-height)] w-full min-w-0 max-w-[var(--app-max-width)] flex-col overflow-hidden bg-background ${className}`}
      {...props}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)]">
        {children}
      </div>
      {footer ? (
        <div className="shrink-0 pb-[env(safe-area-inset-bottom,0px)]">{footer}</div>
      ) : null}
    </div>
  );
}
