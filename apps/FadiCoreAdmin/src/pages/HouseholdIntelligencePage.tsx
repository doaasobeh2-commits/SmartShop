import {
  AdminTopBar,
  EngineConfidenceChart,
  KpiStatCard,
  SignalIngestionChart,
  TasteTrends,
} from "../components";
import { householdKpiStats } from "../data/householdIntelligence";

export function HouseholdIntelligencePage() {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <AdminTopBar crumb="Fadi Core Admin" section="Household Intelligence" />

      <section className="mt-6">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-navy-ink sm:text-[28px]">
          Household Intelligence
        </h1>
        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-slate-body">
          Anonymized signal ingestion, confidence trends, and behavioral
          inference. Internal admin view only — no personal details exposed.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {householdKpiStats.map((stat) => (
          <KpiStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="mt-5">
        <SignalIngestionChart />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <EngineConfidenceChart />
        <TasteTrends />
      </section>
    </main>
  );
}
