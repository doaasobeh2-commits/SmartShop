import { useMemo, useState } from "react";
import {
  AdminTopBar,
  FutureModuleCard,
  MilestoneTimeline,
  ModuleCard,
  StatusBadge,
} from "../components";
import {
  activeModules,
  futureModules,
  milestones,
} from "../data/roadmap";

type ExpandedTarget =
  | { kind: "active" | "future"; id: string }
  | null;

export function RoadmapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<ExpandedTarget>(null);

  const q = searchQuery.trim().toLowerCase();

  const filteredActive = useMemo(() => {
    if (!q) return activeModules;
    return activeModules.filter((module) => {
      return (
        module.name.toLowerCase().includes(q) ||
        module.description.toLowerCase().includes(q) ||
        module.status.toLowerCase().includes(q) ||
        module.version.toLowerCase().includes(q) ||
        module.features.some((feature) =>
          feature.label.toLowerCase().includes(q),
        )
      );
    });
  }, [q]);

  const filteredFuture = useMemo(() => {
    if (!q) return futureModules;
    return futureModules.filter((module) => {
      return (
        module.name.toLowerCase().includes(q) ||
        module.description.toLowerCase().includes(q) ||
        module.eta.toLowerCase().includes(q)
      );
    });
  }, [q]);

  const filteredMilestones = useMemo(() => {
    if (!q) return milestones;
    return milestones.filter((milestone) => {
      return (
        milestone.date.toLowerCase().includes(q) ||
        milestone.title.toLowerCase().includes(q) ||
        milestone.description.toLowerCase().includes(q) ||
        milestone.status.toLowerCase().includes(q)
      );
    });
  }, [q]);

  function toggle(kind: "active" | "future", id: string) {
    setExpanded((current) =>
      current?.kind === kind && current.id === id ? null : { kind, id },
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <AdminTopBar
        crumb="Fadi Core Admin"
        section="Roadmap"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search modules, milestones..."
        searchMode="filter"
      />

      <section className="mt-6">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-navy-ink sm:text-[28px]">
          Roadmap / Modules
        </h1>
        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-slate-body">
          Platform module status, integration milestones, and future application
          planning.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-label">
          Active Modules
        </h2>
        {filteredActive.length === 0 ? (
          <EmptyState message="No active modules match the current search." />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {filteredActive.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                expanded={
                  expanded?.kind === "active" && expanded.id === module.id
                }
                onToggle={(id) => toggle("active", id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-7 rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-navy-ink">
              Future Modules
            </h2>
            <p className="mt-1 text-[12.5px] text-slate-body">
              Upcoming platform integrations — placeholder.
            </p>
          </div>
          <StatusBadge variant="PLANNED" />
        </div>

        {filteredFuture.length === 0 ? (
          <EmptyState message="No future modules match the current search." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filteredFuture.map((module) => (
              <FutureModuleCard
                key={module.id}
                module={module}
                expanded={
                  expanded?.kind === "future" && expanded.id === module.id
                }
                onToggle={(id) => toggle("future", id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-5">
        <MilestoneTimeline milestones={filteredMilestones} />
      </section>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-dashed border-slate-line bg-white px-5 py-8 text-center text-[13px] text-slate-label">
      {message}
    </div>
  );
}
