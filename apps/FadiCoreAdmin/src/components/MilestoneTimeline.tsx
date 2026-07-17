import type { Milestone } from "../data/roadmap";
import { StatusBadge } from "./StatusBadge";

type MilestoneTimelineProps = {
  milestones: Milestone[];
};

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-5 text-[15px] font-semibold text-navy-ink">
        Integration Milestones
      </h2>

      {milestones.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-slate-label">
          No milestones match the current search.
        </p>
      ) : (
        <ol className="relative space-y-0">
          {milestones.map((milestone, index) => {
            const isLast = index === milestones.length - 1;
            const dotColor =
              milestone.status === "complete"
                ? "bg-success"
                : milestone.status === "in-progress"
                  ? "bg-[#E89A2E]"
                  : "bg-slate-icon";

            return (
              <li key={milestone.id} className="relative flex gap-4 pb-5 last:pb-0">
                {!isLast ? (
                  <span
                    className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-slate-line"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={`relative z-[1] mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-stat text-[12px] font-medium text-navy">
                      {milestone.date}
                    </span>
                    <StatusBadge
                      variant={
                        milestone.status === "complete"
                          ? "COMPLETE"
                          : milestone.status === "in-progress"
                            ? "PROCESSING"
                            : "PLANNED"
                      }
                      label={
                        milestone.status === "complete"
                          ? "Complete"
                          : milestone.status === "in-progress"
                            ? "In progress"
                            : "Planned"
                      }
                    />
                  </div>
                  <div className="mt-1 text-[13.5px] font-semibold text-navy-ink">
                    {milestone.title}
                  </div>
                  <p className="mt-1 text-[12.5px] text-slate-body">
                    {milestone.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
