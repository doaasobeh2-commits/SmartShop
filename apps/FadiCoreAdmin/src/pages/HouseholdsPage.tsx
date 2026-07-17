import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHouseholds } from "../api/adminApi";
import { ApiError } from "../api/client";
import type { PlatformHousehold } from "../api/types";
import { AdminTopBar } from "../components/AdminTopBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";

export function HouseholdsPage() {
  const [rows, setRows] = useState<PlatformHousehold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows((await fetchHouseholds()).households);
    } catch (err) {
      setRows([]);
      setError(err instanceof ApiError ? err.message : "Failed to load households");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminTopBar title="Households" subtitle="Canonical household identities" />
      <div className="px-4 py-6 lg:px-8">
        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState title="Could not load households" detail={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error && rows.length === 0 ? (
          <EmptyState title="No households yet" />
        ) : null}
        {!loading && !error && rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-line bg-white">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-canvas text-[11px] uppercase tracking-[0.1em] text-slate-label">
                <tr>
                  <th className="px-4 py-3">Household</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Pending invites</th>
                  <th className="px-4 py-3">Locale</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={h.id} className="border-t border-slate-line">
                    <td className="px-4 py-3">
                      <Link className="font-medium text-navy underline" to={`/households/${h.id}`}>
                        {h.name}
                      </Link>
                      <div className="text-slate-label">{h.publicAlias}</div>
                    </td>
                    <td className="px-4 py-3">
                      {h.ownerDisplayName ?? "—"}
                      <div className="text-slate-label">{h.ownerEmail}</div>
                    </td>
                    <td className="px-4 py-3">{h.activeMemberCount}</td>
                    <td className="px-4 py-3">{h.pendingInvitationCount}</td>
                    <td className="px-4 py-3">{h.preferredLocale}</td>
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
