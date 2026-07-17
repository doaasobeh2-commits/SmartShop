import type { BehavioralSignal } from "../data/signalsLogs";

type SignalDetailsPanelProps = {
  signal: BehavioralSignal;
};

export function SignalDetailsPanel({ signal }: SignalDetailsPanelProps) {
  const { details } = signal;

  return (
    <div className="border-t border-slate-line bg-[#F8FAFD] px-5 py-4">
      <div className="mb-3 text-[12px] font-semibold text-navy-ink">
        Signal details — {signal.id}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="rounded-[10px] border border-slate-line/80 bg-white p-3.5">
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Signal metadata
          </h4>
          <dl className="space-y-2">
            {Object.entries(details.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3 text-[12px]">
                <dt className="text-slate-label">{key}</dt>
                <dd className="font-stat text-navy-ink">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 text-[12px]">
              <dt className="text-slate-label">Household</dt>
              <dd className="font-stat text-navy-ink">{signal.householdId}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[10px] border border-slate-line/80 bg-white p-3.5">
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Source engine
          </h4>
          <p className="font-stat text-[12.5px] text-accent-purple">
            [{details.sourceEngine}]
          </p>
          <h4 className="mb-2 mt-4 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Confidence evolution
          </h4>
          <ul className="space-y-1.5">
            {details.confidenceEvolution.map((step) => (
              <li key={step} className="font-stat text-[12px] text-navy-muted">
                {step}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[10px] border border-slate-line/80 bg-white p-3.5">
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Processing history
          </h4>
          <ul className="space-y-1.5">
            {details.processingHistory.map((step) => (
              <li
                key={step}
                className="text-[12px] leading-snug text-navy-muted"
              >
                {step}
              </li>
            ))}
          </ul>
          <h4 className="mb-2 mt-4 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Related inference IDs
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {details.relatedInferenceIds.map((id) => (
              <span
                key={id}
                className="rounded-md bg-accent-purpleSoft px-1.5 py-0.5 font-stat text-[11px] text-accent-purple"
              >
                {id}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
