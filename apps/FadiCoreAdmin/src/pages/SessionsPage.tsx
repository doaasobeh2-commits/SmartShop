import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSessions } from "../api/adminApi";
import { ApiError } from "../api/client";
import type { SessionRow } from "../api/types";
import { AdminTopBar } from "../components/AdminTopBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";

export function SessionsPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows((await fetchSessions()).sessions);
    } catch (err) {
      setRows([]);
      setError(err instanceof ApiError ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminTopBar title="User sessions" subtitle="Active and recent sessions (no token hashes)" />
      <div className="px-4 py-6 lg:px-8">
        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState title="Could not load sessions" detail={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error && rows.length === 0 ? (
          <EmptyState title="No sessions" />
        ) : null}
        {!loading && !error && rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-line bg-white">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-canvas text-[11px] uppercase tracking-[0.1em] text-slate-label">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-line">
                    <td className="px-4 py-3">
                      <Link className="underline" to={`/users/${r.userId}`}>
                        {r.displayName}
                      </Link>
                      <div className="text-slate-label">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">{r.active ? "yes" : "no"}</td>
                    <td className="px-4 py-3">{r.createdAt}</td>
                    <td className="px-4 py-3">{r.expiresAt}</td>
                    <td className="px-4 py-3">{r.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
