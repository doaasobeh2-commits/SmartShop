import {
  platformColumns,
  type PermissionRow,
} from "../data/safetyPrivacy";
import { PermissionCell } from "./PermissionCell";
import { PermissionDetailsPanel } from "./PermissionDetailsPanel";

type PermissionMatrixProps = {
  rows: PermissionRow[];
  expandedId: string | null;
  onToggle: (permissionId: string) => void;
};

export function PermissionMatrix({
  rows,
  expandedId,
  onToggle,
}: PermissionMatrixProps) {
  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-navy-ink">
        Data Permission Matrix
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-line text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-label">
              <th className="pb-3 pr-4 font-semibold">Permission</th>
              {platformColumns.map((column) => (
                <th
                  key={column.id}
                  className="pb-3 pr-4 text-center font-semibold last:pr-0"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-[13px] text-slate-label"
                >
                  No permissions match the current search.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const expanded = expandedId === row.id;
                return (
                  <PermissionMatrixRow
                    key={row.id}
                    row={row}
                    expanded={expanded}
                    onToggle={onToggle}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function PermissionMatrixRow({
  row,
  expanded,
  onToggle,
}: {
  row: PermissionRow;
  expanded: boolean;
  onToggle: (permissionId: string) => void;
}) {
  return (
    <>
      <tr
        className={[
          "cursor-pointer border-b border-slate-line/70 transition-colors",
          expanded ? "bg-[#F5F7FC]" : "hover:bg-[#F8FAFD]",
        ].join(" ")}
        onClick={() => onToggle(row.id)}
        aria-expanded={expanded}
      >
        <td className="py-3.5 pr-4 text-[13px] font-medium text-navy-ink">
          {row.permission}
        </td>
        {platformColumns.map((column) => (
          <td key={column.id} className="py-3.5 pr-4 text-center last:pr-0">
            <div className="flex justify-center">
              <PermissionCell value={row.access[column.id]} />
            </div>
          </td>
        ))}
      </tr>
      {expanded ? (
        <tr className="border-b border-slate-line/70">
          <td colSpan={5} className="p-0">
            <PermissionDetailsPanel row={row} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
