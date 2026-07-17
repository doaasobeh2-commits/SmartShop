import type { BehavioralSignal } from "../data/signalsLogs";
import { SignalRow } from "./SignalRow";

type SignalTableProps = {
  signals: BehavioralSignal[];
  expandedId: string | null;
  onToggle: (signalId: string) => void;
};

export function SignalTable({
  signals,
  expandedId,
  onToggle,
}: SignalTableProps) {
  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-line text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-label">
              <th className="pb-3 pr-4 font-semibold">Signal ID</th>
              <th className="pb-3 pr-4 font-semibold">Type</th>
              <th className="pb-3 pr-4 font-semibold">Household</th>
              <th className="pb-3 pr-4 font-semibold">Description</th>
              <th className="pb-3 pr-4 font-semibold">Confidence</th>
              <th className="pb-3 pr-4 font-semibold">App</th>
              <th className="pb-3 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {signals.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-[13px] text-slate-label"
                >
                  No signals match the current filters.
                </td>
              </tr>
            ) : (
              signals.map((signal) => (
                <SignalRow
                  key={signal.id}
                  signal={signal}
                  expanded={expandedId === signal.id}
                  onToggle={onToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
