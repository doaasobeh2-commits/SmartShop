import {
  confidenceBarTone,
  signalTypeStyles,
  type BehavioralSignal,
} from "../data/signalsLogs";
import { SignalDetailsPanel } from "./SignalDetailsPanel";

const barColors = {
  green: "bg-[#2F9E6B]",
  amber: "bg-[#E0A93B]",
  red: "bg-[#F07A7A]",
} as const;

type SignalRowProps = {
  signal: BehavioralSignal;
  expanded: boolean;
  onToggle: (signalId: string) => void;
};

export function SignalRow({ signal, expanded, onToggle }: SignalRowProps) {
  const tone = confidenceBarTone(signal.confidence);

  return (
    <>
      <tr
        className={[
          "cursor-pointer border-b border-slate-line/70 transition-colors",
          expanded ? "bg-[#F5F7FC]" : "hover:bg-[#F8FAFD]",
        ].join(" ")}
        onClick={() => onToggle(signal.id)}
        aria-expanded={expanded}
      >
        <td className="py-3.5 pr-4">
          <span className="font-stat text-[12.5px] font-medium text-navy">
            {signal.id}
          </span>
        </td>
        <td className="py-3.5 pr-4">
          <span
            className={`inline-flex rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] ${signalTypeStyles[signal.type]}`}
          >
            {signal.type}
          </span>
        </td>
        <td className="py-3.5 pr-4 font-stat text-[12.5px] text-navy-muted">
          {signal.householdId}
        </td>
        <td className="py-3.5 pr-4 text-[12.5px] text-slate-body">
          {signal.description}
        </td>
        <td className="py-3.5 pr-4">
          <div className="flex min-w-[110px] items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF1F6]">
              <div
                className={`h-full rounded-full ${barColors[tone]}`}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
            <span className="font-stat text-[12px] text-navy-ink">
              {signal.confidence}%
            </span>
          </div>
        </td>
        <td className="py-3.5 pr-4 text-[12.5px] text-slate-body">
          {signal.app}
        </td>
        <td className="py-3.5 font-stat text-[12px] text-slate-label">
          {signal.time}
        </td>
      </tr>
      {expanded ? (
        <tr className="border-b border-slate-line/70">
          <td colSpan={7} className="p-0">
            <SignalDetailsPanel signal={signal} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
