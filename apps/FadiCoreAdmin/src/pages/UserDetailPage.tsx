import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchUser } from "../api/adminApi";
import { ApiError } from "../api/client";
import type { PlatformUser } from "../api/types";
import { AdminTopBar } from "../components/AdminTopBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";

export function UserDetailPage() {
  const { userId = "" } = useParams();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUser(userId);
      setUser(res.user);
    } catch (err) {
      setUser(null);
      setError(err instanceof ApiError ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminTopBar title="User detail" subtitle={user?.email ?? userId} />
      <div className="space-y-4 px-4 py-6 lg:px-8">
        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState title="Could not load user" detail={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error && !user ? <EmptyState title="User not found" /> : null}
        {user ? (
          <>
            <div className="rounded-xl border border-slate-line bg-white p-4 text-[13px]">
              <div className="text-[18px] font-semibold text-navy-ink">{user.displayName}</div>
              <div className="mt-1 text-slate-label">{user.email}</div>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-label">Status</dt>
                  <dd>{user.status}</dd>
                </div>
                <div>
                  <dt className="text-slate-label">Active sessions</dt>
                  <dd>{user.sessionCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-label">Created</dt>
                  <dd>{user.createdAt}</dd>
                </div>
                <div>
                  <dt className="text-slate-label">Last login</dt>
                  <dd>{user.lastLoginAt ?? "—"}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold text-navy-ink">Memberships</h2>
              {user.memberships.length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No memberships" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-[13px]">
                  {user.memberships.map((m) => (
                    <li key={m.memberId} className="rounded-lg bg-canvas px-3 py-2">
                      <Link className="font-medium text-navy underline" to={`/households/${m.householdId}`}>
                        {m.householdName}
                      </Link>
                      <div className="text-slate-label">
                        {m.role} · {m.status}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
