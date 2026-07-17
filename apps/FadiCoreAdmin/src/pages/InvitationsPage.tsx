import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchInvitations } from "../api/adminApi";
import { ApiError } from "../api/client";
import type { InvitationRow } from "../api/types";
import { AdminTopBar } from "../components/AdminTopBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";

export function InvitationsPage() {
  const [rows, setRows] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows((await fetchInvitations()).invitations);
    } catch (err) {
      setRows([]);
      setError(err instanceof ApiError ? err.message : "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminTopBar title="Invitations" subtitle="Household invite status" />
      <div className="px-4 py-6 lg:px-8">
        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState title="Could not load invitations" detail={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error && rows.length === 0 ? (
          <EmptyState title="No invitations" />
        ) : null}
        {!loading && !error && rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-line bg-white">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-canvas text-[11px] uppercase tracking-[0.1em] text-slate-label">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Household</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-line">
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">
                      <Link className="underline" to={`/households/${r.householdId}`}>
                        {r.householdName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{r.role}</td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3">{r.expiresAt}</td>
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
