import { useMemo, useState } from "react";
import { AdminTopBar, EngineCard } from "../components";
import {
  intelligenceEngines,
  type EngineId,
} from "../data/intelligenceEngines";

export function IntelligenceEnginesPage() {
  const [expandedId, setExpandedId] = useState<EngineId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEngines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return intelligenceEngines;
    return intelligenceEngines.filter((engine) => {
      return (
        engine.name.toLowerCase().includes(q) ||
        engine.description.toLowerCase().includes(q) ||
        engine.status.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const visibleExpandedId = useMemo(() => {
    if (!expandedId) return null;
    return filteredEngines.some((engine) => engine.id === expandedId)
      ? expandedId
      : null;
  }, [expandedId, filteredEngines]);

  function handleToggle(engineId: EngineId) {
    setExpandedId((current) => (current === engineId ? null : engineId));
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <AdminTopBar
        crumb="Fadi Core Admin"
        section="Intelligence Engines"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search engines, status..."
        searchMode="filter"
      />

      <section className="mt-6">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-navy-ink sm:text-[28px]">
          Intelligence Engines
        </h1>
        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-slate-body">
          Engine status, confidence scores, decision rules, and reinforcement
          logic. Click an engine to expand details.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredEngines.length === 0 ? (
          <div className="col-span-full rounded-card border border-slate-line/80 bg-white px-5 py-10 text-center text-[13px] text-slate-label shadow-card">
            No engines match “{searchQuery.trim()}”.
          </div>
        ) : (
          filteredEngines.map((engine) => (
            <EngineCard
              key={engine.id}
              engine={engine}
              expanded={visibleExpandedId === engine.id}
              onToggle={handleToggle}
            />
          ))
        )}
      </section>
    </main>
  );
}
