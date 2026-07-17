import type { GdprRequest, GdprRequestStatus } from "../data/safetyPrivacy";
import { StatusBadge } from "./StatusBadge";

const statusVariant: Record<
  GdprRequestStatus,
  "COMPLETE" | "PROCESSING" | "PENDING"
> = {
  Complete: "COMPLETE",
  Processing: "PROCESSING",
  Pending: "PENDING",
};

type GDPRRequestListProps = {
  requests: GdprRequest[];
  expandedId: string | null;
  onToggle: (requestId: string) => void;
};

export function GDPRRequestList({
  requests,
  expandedId,
  onToggle,
}: GDPRRequestListProps) {
  return (
    <article className="flex h-full flex-col rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-navy-ink">
        GDPR Request Queue
      </h2>

      {requests.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-slate-label">
          No GDPR requests match the current search.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col">
          {requests.map((request) => {
            const expanded = expandedId === request.id;
            return (
              <li
                key={request.id}
                className="border-b border-slate-line/70 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onToggle(request.id)}
                  aria-expanded={expanded}
                  className={[
                    "flex w-full flex-wrap items-center gap-3 px-1 py-3.5 text-left transition-colors",
                    expanded ? "bg-[#F5F7FC]" : "hover:bg-[#F8FAFD]",
                  ].join(" ")}
                >
                  <StatusBadge variant={request.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-stat text-[12.5px] font-medium text-navy-ink">
                        {request.householdId}
                      </span>
                      <span className="font-stat text-[12px] text-slate-label">
                        {request.requestId}
                      </span>
                      <span className="text-[12px] text-slate-label">
                        {request.age}
                      </span>
                    </div>
                  </div>
                  <StatusBadge
                    variant={statusVariant[request.status]}
                    withDot
                    label={request.status}
                  />
                </button>

                {expanded ? (
                  <div className="border-t border-slate-line bg-[#F8FAFD] px-3 py-3.5">
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Meta label="Requested by" value={request.details.requestedBy} />
                      <Meta label="Reason" value={request.details.reason} />
                    </dl>
                    <div className="mt-3">
                      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
                        Scope
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {request.details.scope.map((item) => (
                          <span
                            key={item}
                            className="rounded-md bg-white px-1.5 py-0.5 text-[11px] text-navy-muted ring-1 ring-slate-line"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
                        Timeline
                      </div>
                      <ul className="space-y-1">
                        {request.details.timeline.map((step) => (
                          <li
                            key={step}
                            className="text-[12px] text-navy-muted"
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
        {label}
      </dt>
      <dd className="mt-1 text-[12.5px] text-navy-ink">{value}</dd>
    </div>
  );
}
