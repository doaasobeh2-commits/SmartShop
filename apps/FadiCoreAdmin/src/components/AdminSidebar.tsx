import { NavLink } from "react-router-dom";
import { useAdminUi } from "../context/AdminUiContext";
import { navItems } from "../data/navigation";

export function AdminSidebar() {
  const { showNotice } = useAdminUi();

  return (
    <aside className="flex h-full w-sidebar shrink-0 flex-col border-r border-slate-line bg-white">
      <div className="px-6 pb-6 pt-7">
        <NavLink
          to="/platform-overview"
          className="block text-[18px] font-semibold leading-none tracking-[-0.02em] text-navy-ink"
        >
          Fadi Core
        </NavLink>
        <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-label">
          Admin · Internal
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.implemented) {
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
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => showNotice(`${item.label} is coming soon.`)}
              className="flex items-center gap-3 rounded-nav px-3 py-[10px] text-left text-[13.5px] font-medium text-slate-body transition-colors hover:bg-canvas"
            >
              <Icon className="text-slate-icon" size={17} strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-line px-5 py-5">
        <button
          type="button"
          onClick={() => showNotice("Signed in as fadi.admin (Owner).")}
          className="flex w-full items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-[13px] font-semibold text-white">
            F
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-navy-ink">
              fadi.admin
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-label">
              Owner
            </div>
          </div>
        </button>
        <div className="mt-4 flex items-center gap-2 text-[12px] text-slate-body">
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          <span>All systems nominal</span>
        </div>
      </div>
    </aside>
  );
}
