import type { ActiveModule, FutureModule } from "../data/roadmap";

type ModuleDetailsPanelProps = {
  module: ActiveModule | (FutureModule & { status?: "PLANNED" });
  kind: "active" | "future";
};

export function ModuleDetailsPanel({ module, kind }: ModuleDetailsPanelProps) {
  const plannedVersion =
    kind === "active"
      ? (module as ActiveModule).plannedVersion
      : (module as FutureModule).details.plannedVersion;

  const currentVersion =
    kind === "active" ? (module as ActiveModule).version : "—";

  const dependencies =
    kind === "active"
      ? (module as ActiveModule).details.dependencies
      : (module as FutureModule).details.dependencies;

  const connectedEngines =
    kind === "active"
      ? (module as ActiveModule).details.connectedEngines
      : (module as FutureModule).details.connectedEngines;

  const historyOrNotes =
    kind === "active"
      ? (module as ActiveModule).details.deploymentHistory
      : (module as FutureModule).details.notes;

  const releaseNotes =
    kind === "active" ? (module as ActiveModule).details.releaseNotes : [];

  return (
    <div className="border-t border-slate-line bg-[#F8FAFD] px-5 py-4">
      <div className="mb-3 text-[13px] font-semibold text-navy-ink">
        Module details — {module.name}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <MetaCard
          title="Versions"
          rows={[
            { label: "Current version", value: currentVersion },
            { label: "Planned version", value: plannedVersion },
          ]}
        />
        <ListCard title="Dependencies" items={dependencies} />
        <ListCard title="Connected engines" items={connectedEngines} mono />
        <ListCard
          title={kind === "active" ? "Deployment history" : "Planning notes"}
          items={historyOrNotes}
        />
      </div>

      {releaseNotes.length > 0 ? (
        <div className="mt-3 rounded-[10px] border border-slate-line/80 bg-white p-3.5">
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Release notes
          </div>
          <ul className="space-y-1.5">
            {releaseNotes.map((note) => (
              <li key={note} className="text-[12.5px] text-navy-muted">
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MetaCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-[10px] border border-slate-line/80 bg-white p-3.5">
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
        {title}
      </div>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-[12.5px]">
            <dt className="text-slate-label">{row.label}</dt>
            <dd className="font-stat text-navy-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ListCard({
  title,
  items,
  mono = false,
}: {
  title: string;
  items: string[];
  mono?: boolean;
}) {
  return (
    <div className="rounded-[10px] border border-slate-line/80 bg-white p-3.5">
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={[
              "text-[12.5px] text-navy-muted",
              mono ? "font-stat text-accent-purple" : "",
            ].join(" ")}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
