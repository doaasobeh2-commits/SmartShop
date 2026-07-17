import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  AdminTopBar,
  InferenceLogPanel,
  SignalTable,
} from "../components";
import { useAdminUi } from "../context/AdminUiContext";
import {
  behavioralSignals,
  inferenceLogs,
  signalCategories,
  signalsToCsv,
  type SignalCategoryFilter,
} from "../data/signalsLogs";

export function SignalsLogsPage() {
  const { showNotice } = useAdminUi();
  const [category, setCategory] = useState<SignalCategoryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSignals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return behavioralSignals.filter((signal) => {
      const matchesCategory = category === "ALL" || signal.type === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        signal.id.toLowerCase().includes(q) ||
        signal.type.toLowerCase().includes(q) ||
        signal.householdId.toLowerCase().includes(q) ||
        signal.description.toLowerCase().includes(q) ||
        signal.app.toLowerCase().includes(q)
      );
    });
  }, [category, searchQuery]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return inferenceLogs;
    return inferenceLogs.filter((entry) => {
      return (
        entry.timestamp.toLowerCase().includes(q) ||
        entry.engine.toLowerCase().includes(q) ||
        entry.inferenceType.toLowerCase().includes(q) ||
        entry.message.toLowerCase().includes(q) ||
        entry.severity.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const visibleExpandedId = useMemo(() => {
    if (!expandedId) return null;
    return filteredSignals.some((signal) => signal.id === expandedId)
      ? expandedId
      : null;
  }, [expandedId, filteredSignals]);

  function handleToggle(signalId: string) {
    setExpandedId((current) => (current === signalId ? null : signalId));
  }

  function handleExport() {
    const csv = signalsToCsv(filteredSignals);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fadi-signals-${category.toLowerCase()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showNotice(`Exported ${filteredSignals.length} signal(s) to CSV.`);
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <AdminTopBar
        crumb="Fadi Core Admin"
        section="Signals & Logs"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search signals, households..."
        searchMode="filter"
      />

      <section className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-navy-ink sm:text-[28px]">
            Signals & Logs
          </h1>
          <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-slate-body">
            Behavioral signals, inference logs, and audit records. Household IDs
            are anonymized — no personal data is displayed.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-nav bg-navy px-3.5 py-2 text-[12.5px] font-medium text-white shadow-sm transition-colors hover:bg-navy/90"
        >
          <Download size={14} strokeWidth={2} />
          Export logs
        </button>
      </section>

      <section className="mt-5 flex flex-wrap gap-2">
        {signalCategories.map((tab) => {
          const active = category === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setCategory(tab)}
              className={[
                "rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
                active
                  ? "bg-navy text-white"
                  : "bg-[#E7EBF3] text-slate-body hover:bg-[#DDE3EF]",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </section>

      <section className="mt-5">
        <SignalTable
          signals={filteredSignals}
          expandedId={visibleExpandedId}
          onToggle={handleToggle}
        />
      </section>

      <section className="mt-5">
        <InferenceLogPanel entries={filteredLogs} />
      </section>
    </main>
  );
}
