import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchHousehold } from "../api/adminApi";
import { ApiError } from "../api/client";
import { AdminTopBar } from "../components/AdminTopBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/AsyncStates";

type Detail = Awaited<ReturnType<typeof fetchHousehold>>;

export function HouseholdDetailPage() {
  const { householdId = "" } = useParams();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchHousehold(householdId));
    } catch (err) {
      setData(null);
      setError(err instanceof ApiError ? err.message : "Failed to load household");
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminTopBar
        title="Household detail"
        subtitle={data?.household.name ?? householdId}
      />
      <div className="space-y-4 px-4 py-6 lg:px-8">
        {loading ? <LoadingState /> : null}
        {error ? (
          <ErrorState title="Could not load household" detail={error} onRetry={() => void load()} />
        ) : null}
        {!loading && !error && !data ? <EmptyState title="Household not found" /> : null}
        {data ? (
          <>
            <div className="rounded-xl border border-slate-line bg-white p-4 text-[13px]">
              <div className="text-[18px] font-semibold text-navy-ink">
                {data.household.name}
              </div>
              <div className="text-slate-label">{data.household.publicAlias}</div>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-label">Owner</dt>
                  <dd>
                    {data.household.ownerUserId ? (
                      <Link
                        className="underline"
                        to={`/users/${data.household.ownerUserId}`}
                      >
                        {data.household.ownerDisplayName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-label">Locale</dt>
                  <dd>{data.household.preferredLocale}</dd>
                </div>
                <div>
                  <dt className="text-slate-label">Created</dt>
                  <dd>{data.household.createdAt}</dd>
                </div>
                <div>
                  <dt className="text-slate-label">Invitation summary</dt>
                  <dd>
                    pending {data.invitationSummary.pending ?? 0} · accepted{" "}
                    {data.invitationSummary.accepted ?? 0} · revoked{" "}
                    {data.invitationSummary.revoked ?? 0}
                  </dd>
                </div>
              </dl>
            </div>

            <section className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold">Members</h2>
              <ul className="mt-3 space-y-2 text-[13px]">
                {data.members.map((m) => (
                  <li key={m.id} className="rounded-lg bg-canvas px-3 py-2">
                    <Link className="font-medium underline" to={`/users/${m.userId}`}>
                      {m.displayName}
                    </Link>
                    <div className="text-slate-label">
                      {m.email} · {m.role} · {m.status}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold">Invitations</h2>
              {data.invitations.length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No invitations" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-[13px]">
                  {data.invitations.map((i) => (
                    <li key={i.id} className="rounded-lg bg-canvas px-3 py-2">
                      {i.email} · {i.role} · {i.status}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
