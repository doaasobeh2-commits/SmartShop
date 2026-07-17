import { useCallback, useEffect, useState } from "react";
import { fetchAuditLogs } from "../api/adminApi";
import { ApiError } from "../api/client";
import type { AuditPage } from "../api/types";
import { AdminTopBar } from "../components/AdminTopBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";

export function AuditLogsPage() {
  const [data, setData] = useState<AuditPage | null>(null);
  const [page, setPage] = useState(1);
  const [actorType, setActorType] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await fetchAuditLogs({
          page,
          pageSize: 20,
          actorType: actorType || undefined,
          action: action || undefined,
        }),
      );
    } catch (err) {
      setData(null);
      setError(err instanceof ApiError ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, actorType, action]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminTopBar title="Audit logs" subtitle="Redacted metadata only" />
      <div className="space-y-4 px-4 py-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          <input
            className="rounded-lg border border-slate-line px-3 py-2 text-[13px]"
            placeholder="Actor type (user, admin…)"
            value={actorType}
            onChange={(e) => {
              setPage(1);
              setActorType(e.target.value);
            }}
          />
          <input
            className="rounded-lg border border-slate-line px-3 py-2 text-[13px]"
            placeholder="Action (user.login…)"
            value={action}
            onChange={(e) => {
              setPage(1);
              setAction(e.target.value);
            }}
          />
        </div>

        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState title="Could not load audit logs" detail={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error && data && data.items.length === 0 ? (
          <EmptyState title="No audit events match" />
        ) : null}
        {!loading && !error && data && data.items.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-xl border border-slate-line bg-white">
              <table className="min-w-full text-left text-[13px]">
                <thead className="bg-canvas text-[11px] uppercase tracking-[0.1em] text-slate-label">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-line align-top">
                      <td className="px-4 py-3 whitespace-nowrap">{item.createdAt}</td>
                      <td className="px-4 py-3">{item.action}</td>
                      <td className="px-4 py-3">
                        {item.actorType}
                        <div className="text-slate-label">{item.actorId}</div>
                      </td>
                      <td className="px-4 py-3">
                        {item.resourceType}
                        <div className="text-slate-label">{item.resourceId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {JSON.stringify(item.meta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded-lg border border-slate-line px-3 py-1.5 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span>
                Page {data.page} · {data.total} total
              </span>
              <button
                type="button"
                disabled={data.page * data.pageSize >= data.total}
                className="rounded-lg border border-slate-line px-3 py-1.5 disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
