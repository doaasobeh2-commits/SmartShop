import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUsers } from "../api/adminApi";
import { ApiError } from "../api/client";
import type { PlatformUser } from "../api/types";
import { AdminTopBar } from "../components/AdminTopBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";

export function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers();
      setUsers(res.users);
    } catch (err) {
      setUsers([]);
      setError(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminTopBar title="Users" subtitle="Registered Fadi accounts" />
      <div className="px-4 py-6 lg:px-8">
        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState title="Could not load users" detail={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error && users.length === 0 ? (
          <EmptyState title="No users yet" detail="Register a user via POST /auth/register." />
        ) : null}
        {!loading && !error && users.length > 0 ? (
          <>
            {(() => {
              const withoutHousehold = users.filter(
                (u) =>
                  u.hasHousehold === false ||
                  (u.hasHousehold === undefined &&
                    !u.memberships.some((m) => m.status === "active")),
              ).length;
              return (
                <div className="mb-4 rounded-xl border border-slate-line bg-white px-4 py-3 text-[13px]">
                  <span className="text-slate-label">Accounts without household</span>
                  <div className="mt-1 text-[22px] font-semibold text-navy-ink">
                    {withoutHousehold}
                  </div>
                </div>
              );
            })()}
            <div className="overflow-hidden rounded-xl border border-slate-line bg-white">
              <table className="min-w-full text-left text-[13px]">
                <thead className="bg-canvas text-[11px] uppercase tracking-[0.1em] text-slate-label">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Household</th>
                    <th className="px-4 py-3">Sessions</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const inHousehold =
                      u.hasHousehold ??
                      u.memberships.some((m) => m.status === "active");
                    return (
                      <tr key={u.id} className="border-t border-slate-line">
                        <td className="px-4 py-3">
                          <Link className="font-medium text-navy underline" to={`/users/${u.id}`}>
                            {u.displayName}
                          </Link>
                          <div className="text-slate-label">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">{u.status}</td>
                        <td className="px-4 py-3">
                          {inHousehold ? u.memberships.length : "none"}
                        </td>
                        <td className="px-4 py-3">{u.sessionCount}</td>
                        <td className="px-4 py-3">{u.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
