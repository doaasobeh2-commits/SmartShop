import type { HTMLAttributes, ReactNode } from "react";

export type PhoneFrameProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/** @deprecated Legacy alias — no mockup chrome. Prefer AppShell. */
export function PhoneFrame({ children, className = "", ...props }: PhoneFrameProps) {
  return (
    <div
      className={`mx-auto flex h-[var(--app-height)] w-full min-w-0 max-w-[var(--app-max-width)] flex-col overflow-hidden bg-background ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
