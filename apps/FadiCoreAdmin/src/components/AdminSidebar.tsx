import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { navItems } from "../data/navigation";

export function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-sidebar shrink-0 flex-col border-r border-slate-line bg-white">
      <div className="px-6 pb-6 pt-7">
        <NavLink
          to="/overview"
          className="block text-[18px] font-semibold leading-none tracking-[-0.02em] text-navy-ink"
        >
          Fadi Core
        </NavLink>
        <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-label">
          Admin · Live API
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-nav px-3 py-[10px] text-[13.5px] font-medium transition-colors",
                  isActive
                    ? "bg-navy text-white shadow-sm"
                    : "text-slate-body hover:bg-canvas",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={isActive ? "text-white" : "text-slate-icon"}
                    size={17}
                    strokeWidth={1.75}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-line px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-[13px] font-semibold text-white">
            {(user?.displayName?.[0] ?? "A").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-navy-ink">
              {user?.displayName ?? "Admin"}
            </div>
            <div className="truncate text-[11px] text-slate-label">
              {user?.email} · {user?.role}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-4 w-full rounded-lg border border-slate-line px-3 py-2 text-[12px] font-medium text-navy hover:bg-canvas"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
