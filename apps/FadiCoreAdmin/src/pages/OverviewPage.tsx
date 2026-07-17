import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOverview } from "../api/adminApi";
import { ApiError } from "../api/client";
import type { OverviewResponse } from "../api/types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";
import { AdminTopBar } from "../components/AdminTopBar";

export function OverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<{ title: string; detail?: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchOverview());
    } catch (err) {
      setData(null);
      if (err instanceof ApiError) {
        if (err.status === 401)
          setError({ title: "Unauthorized", detail: "Admin session required." });
        else if (err.status === 403)
          setError({ title: "Forbidden", detail: "Owner admin role required." });
        else
          setError({
            title: "Server error",
            detail: err.message,
          });
      } else {
        setError({
          title: "Unable to load overview",
          detail: "Check VITE_FADI_CORE_API_URL and API availability.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-full">
      <AdminTopBar title="Overview" subtitle="Live Fadi Core metrics" />
      <div className="space-y-6 px-4 py-6 lg:px-8">
        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState
            title={error.title}
            detail={error.detail}
            onRetry={() => void load()}
          />
        ) : null}
        {!loading && !error && data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(data.metrics).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-line bg-white px-4 py-3"
                >
                  <div className="text-[11px] uppercase tracking-[0.12em] text-slate-label">
                    {key}
                  </div>
                  <div className="mt-2 text-[28px] font-semibold text-navy-ink">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <section className="grid gap-4 lg:grid-cols-3">
              <ListCard
                title="Recent registrations"
                empty="No registrations yet"
                items={data.recentRegistrations.map((u) => ({
                  id: u.id,
                  primary: u.displayName,
                  secondary: u.email,
                  href: `/users/${u.id}`,
                }))}
              />
              <ListCard
                title="Recent logins"
                empty="No logins yet"
                items={data.recentLogins.map((u) => ({
                  id: u.id,
                  primary: u.displayName,
                  secondary: u.lastLoginAt ?? u.email,
                  href: `/users/${u.id}`,
                }))}
              />
              <ListCard
                title="Recent audit"
                empty="No audit events"
                items={data.recentAuditEvents.map((a) => ({
                  id: a.id,
                  primary: a.action,
                  secondary: `${a.actorType} · ${a.createdAt}`,
                  href: "/audit-logs",
                }))}
              />
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ListCard({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; primary: string; secondary: string; href: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-line bg-white p-4">
      <h2 className="text-[14px] font-semibold text-navy-ink">{title}</h2>
      {items.length === 0 ? (
        <div className="mt-3">
          <EmptyState title={empty} />
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="block rounded-lg px-2 py-2 hover:bg-canvas"
              >
                <div className="text-[13px] font-medium text-navy">{item.primary}</div>
                <div className="text-[12px] text-slate-label">{item.secondary}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
