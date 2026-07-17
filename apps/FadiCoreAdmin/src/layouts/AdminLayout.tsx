import { Link, Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminUiProvider, useAdminUi } from "../context/AdminUiContext";
import { navItems } from "../data/navigation";

export function AdminLayout() {
  return (
    <AdminUiProvider>
      <AdminLayoutShell />
    </AdminUiProvider>
  );
}

function AdminLayoutShell() {
  const { notice, clearNotice } = useAdminUi();

  return (
    <div className="flex min-h-full bg-canvas">
      <div className="sticky top-0 hidden h-screen lg:block">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-line bg-white px-4 py-3 lg:hidden">
          <Link
            to="/overview"
            className="block text-[16px] font-semibold text-navy-ink"
          >
            Fadi Core
          </Link>
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-label">
            Admin · Internal
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="shrink-0 rounded-full bg-canvas px-3 py-1.5 text-[12px] font-medium text-navy"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Outlet />
      </div>

      {notice ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-slate-line bg-white px-4 py-3 text-[13px] text-navy-ink shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={clearNotice}
              className="text-slate-label hover:text-navy"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
