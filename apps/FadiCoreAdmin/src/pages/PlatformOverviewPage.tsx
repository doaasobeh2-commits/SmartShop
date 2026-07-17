import { RefreshCw } from "lucide-react";
import {
  AdminTopBar,
  AppStatusCard,
  KpiStatCard,
  RecentAlerts,
  SignalVolumeChart,
} from "../components";
import { connectedApps, kpiStats } from "../data/platformOverview";

export function PlatformOverviewPage() {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <AdminTopBar crumb="Fadi Core Admin" section="Platform Overview" />

      <section className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-navy-ink sm:text-[28px]">
            Platform Overview
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-slate-body">
            Real-time status of Fadi Core Platform and all connected applications.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-label">
          <RefreshCw size={12} strokeWidth={2} className="text-slate-icon" />
          <span>Updated 34s ago</span>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiStats.map((stat) => (
          <KpiStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-label">
          Connected Applications
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {connectedApps.map((app) => (
            <AppStatusCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <SignalVolumeChart />
        <RecentAlerts />
      </section>
    </main>
  );
}
