import type { ApiEndpoint } from "../data/appIntegrations";
import { StatusBadge } from "./StatusBadge";

type ApiEndpointTableProps = {
  endpoints: ApiEndpoint[];
  emptyMessage?: string;
};

export function ApiEndpointTable({
  endpoints,
  emptyMessage = "No endpoints match the current filters.",
}: ApiEndpointTableProps) {
  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-navy-ink">
        API Endpoint Status
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-line text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-label">
              <th className="pb-3 pr-4 font-semibold">Endpoint</th>
              <th className="pb-3 pr-4 font-semibold">App</th>
              <th className="pb-3 pr-4 font-semibold">Method</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 pr-4 font-semibold">Latency</th>
              <th className="pb-3 pr-4 font-semibold">Last Called</th>
              <th className="pb-3 font-semibold">Errors (24h)</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-[13px] text-slate-label"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              endpoints.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-line/70 last:border-b-0"
                >
                  <td className="py-3.5 pr-4 font-stat text-[12.5px] text-navy-ink">
                    {row.endpoint}
                  </td>
                  <td className="py-3.5 pr-4 text-[12.5px] text-slate-body">
                    {row.appLabel}
                  </td>
                  <td className="py-3.5 pr-4 font-stat text-[11.5px] font-medium uppercase tracking-[0.06em] text-navy">
                    {row.method}
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge variant={row.status} withDot />
                  </td>
                  <td className="py-3.5 pr-4 font-stat text-[12.5px] text-navy-muted">
                    {row.latencyMs}ms
                  </td>
                  <td className="py-3.5 pr-4 font-stat text-[12.5px] text-slate-label">
                    {row.lastCalled}
                  </td>
                  <td
                    className={[
                      "py-3.5 font-stat text-[12.5px]",
                      row.errors24h > 0 ? "text-[#C77700]" : "text-slate-body",
                    ].join(" ")}
                  >
                    {row.errors24h}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
