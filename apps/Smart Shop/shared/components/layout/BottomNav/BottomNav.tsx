import type { HTMLAttributes, ReactNode } from "react";

export type BottomNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

export type BottomNavProps = HTMLAttributes<HTMLElement> & {
  items: BottomNavItem[];
  activeId?: string;
  onChange?: (id: string) => void;
};

export function BottomNav({
  items,
  activeId,
  onChange,
  className = "",
  ...props
}: BottomNavProps) {
  return (
    <nav
      className={`border-t border-[var(--border)] bg-[var(--card)] px-4 pb-3 pt-2 ${className}`}
      {...props}
    >
      <ul className="flex items-center justify-between gap-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange?.(item.id)}
                className={`flex w-full flex-col items-center gap-1 rounded-lg px-1 py-1 transition-colors ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                <span className="text-[9px] font-semibold leading-none">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
