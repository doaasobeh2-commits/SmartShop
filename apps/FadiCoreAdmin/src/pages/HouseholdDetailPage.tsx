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

function formatAddress(a: {
  city: string;
  countryCode: string;
  postalCodePrefix: string;
  isPrimary?: boolean;
}) {
  const primary = a.isPrimary ? " · primary" : "";
  return `${a.city}, ${a.postalCodePrefix}… (${a.countryCode})${primary}`;
}

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
                {typeof data.household.pendingJoinRequestCount === "number" ? (
                  <div>
                    <dt className="text-slate-label">Pending join requests</dt>
                    <dd>{data.household.pendingJoinRequestCount}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <section className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold">Addresses (privacy-safe)</h2>
              {(data.addresses ?? []).length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No addresses on file" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-[13px]">
                  {(data.addresses ?? []).map((a, idx) => (
                    <li
                      key={`${a.countryCode}-${a.postalCodePrefix}-${a.city}-${idx}`}
                      className="rounded-lg bg-canvas px-3 py-2"
                    >
                      {formatAddress(a)}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold">Members</h2>
              <ul className="mt-3 space-y-2 text-[13px]">
                {data.members.map((m) => {
                  const memberEnrollments = (data.enrollments ?? []).filter(
                    (e) => e.householdMemberId === m.id,
                  );
                  return (
                    <li key={m.id} className="rounded-lg bg-canvas px-3 py-2">
                      <div className="font-medium">
                        {m.linkedAccount && m.userId ? (
                          <Link className="underline" to={`/users/${m.userId}`}>
                            {m.displayName}
                          </Link>
                        ) : (
                          m.displayName
                        )}
                      </div>
                      <div className="text-slate-label">
                        {m.managed ? "managed profile" : "linked account"}
                        {m.email ? ` · ${m.email}` : ""} · {m.role} · {m.status}
                        {m.ageBand ? ` · ${m.ageBand}` : ""}
                      </div>
                      <div className="mt-1 text-[12px] text-slate-label">
                        Apps:{" "}
                        {memberEnrollments.length === 0
                          ? "none"
                          : memberEnrollments
                              .map((e) => `${e.applicationKey}:${e.status}`)
                              .join(", ")}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold">Join requests</h2>
              {(data.joinRequests ?? []).length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No join requests" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-[13px]">
                  {(data.joinRequests ?? []).map((j) => (
                    <li key={j.id} className="rounded-lg bg-canvas px-3 py-2">
                      {j.requesterEmail ?? j.requesterUserId} · {j.requestedRole} ·{" "}
                      {j.status}
                      <div className="text-slate-label">
                        created {j.createdAt}
                        {j.resolvedAt ? ` · resolved ${j.resolvedAt}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold">Parental approvals</h2>
              {(data.parentalApprovals ?? []).length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No parental approvals" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-[13px]">
                  {(data.parentalApprovals ?? []).map((p) => (
                    <li key={p.id} className="rounded-lg bg-canvas px-3 py-2">
                      {p.applicationKey} · {p.status}
                      <div className="text-slate-label">
                        member {p.householdMemberId}
                        {p.approvedAt ? ` · approved ${p.approvedAt}` : ""}
                        {p.revokedAt ? ` · revoked ${p.revokedAt}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-line bg-white p-4">
              <h2 className="text-[14px] font-semibold">Account claims</h2>
              {(data.claims ?? []).length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No account claims" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-[13px]">
                  {(data.claims ?? []).map((c) => (
                    <li key={c.id} className="rounded-lg bg-canvas px-3 py-2">
                      member {c.householdMemberId} · {c.status}
                      <div className="text-slate-label">
                        expires {c.expiresAt}
                        {c.acceptedAt ? ` · accepted ${c.acceptedAt}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
