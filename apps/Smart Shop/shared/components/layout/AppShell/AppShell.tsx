import type { HTMLAttributes, ReactNode } from "react";
import { PhoneFrame } from "../PhoneFrame";

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  footer?: ReactNode;
};

export function AppShell({ children, footer, className = "", ...props }: AppShellProps) {
  return (
    <PhoneFrame className={className} {...props}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">{children}</div>
        {footer}
      </div>
    </PhoneFrame>
  );
}
