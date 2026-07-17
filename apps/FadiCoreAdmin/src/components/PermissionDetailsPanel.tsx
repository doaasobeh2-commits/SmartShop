import {
  appLabels,
  type PermissionRow,
  type PlatformApp,
} from "../data/safetyPrivacy";
import { StatusBadge } from "./StatusBadge";

type PermissionDetailsPanelProps = {
  row: PermissionRow;
};

export function PermissionDetailsPanel({ row }: PermissionDetailsPanelProps) {
  const appsWithAccess = (
    Object.entries(row.access) as [PlatformApp, string][]
  )
    .filter(([, value]) => value === "allow")
    .map(([app]) => appLabels[app]);

  return (
    <div className="border-t border-slate-line bg-[#F8FAFD] px-5 py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-[13px] font-semibold text-navy-ink">
          {row.permission}
        </h4>
        <StatusBadge variant="INFO" label="Permission" />
      </div>

      <p className="mb-4 text-[12.5px] leading-relaxed text-slate-body">
        {row.description}
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <section className="rounded-[10px] border border-slate-line/80 bg-white p-3.5">
          <h5 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Applications with access
          </h5>
          {appsWithAccess.length === 0 ? (
            <p className="text-[12.5px] text-slate-label">None</p>
          ) : (
            <ul className="space-y-1.5">
              {appsWithAccess.map((app) => (
                <li key={app} className="text-[12.5px] text-navy-muted">
                  {app}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[10px] border border-slate-line/80 bg-white p-3.5 md:col-span-2">
          <h5 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Audit history
          </h5>
          <ul className="space-y-1.5">
            {row.auditHistory.map((item) => (
              <li key={item} className="text-[12.5px] text-navy-muted">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between gap-3 border-t border-slate-line pt-3 text-[12px]">
            <span className="text-slate-label">Last modified</span>
            <span className="font-stat text-navy-ink">{row.lastModified}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
