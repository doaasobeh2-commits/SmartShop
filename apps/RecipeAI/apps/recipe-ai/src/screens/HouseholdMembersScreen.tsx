import { useCallback, useEffect, useState } from "react";
import { PrimaryButton, TextButton } from "@recipe-ai/shared";
import {
  createManagedMember,
  listHouseholdMembers,
  type HouseholdMember,
  type ManagedMemberRole,
} from "../api/coreApi";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import {
  ErrorState,
  LoadingState,
  mapApiErrorMessage,
} from "../components/AsyncStates";
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { useI18n } from "../i18n/useI18n";
import type { MessageKey } from "../i18n/types";

const MANAGED_ROLES: ManagedMemberRole[] = ["child", "teen", "caregiver"];

const ROLE_LABEL_KEYS: Record<string, MessageKey> = {
  owner: "roleOwner",
  adult: "roleAdult",
  teen: "roleTeen",
  child: "roleChild",
  caregiver: "roleCaregiver",
};

type HouseholdMembersScreenProps = {
  onContinue: () => void;
  onSkip: () => void;
};

export function HouseholdMembersScreen({
  onContinue,
  onSkip,
}: HouseholdMembersScreenProps) {
  const auth = useAuth();
  const { t, locale } = useI18n();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<ManagedMemberRole>("child");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const refreshMembers = useCallback(async () => {
    setLoadError(null);
    try {
      const { members: list } = await listHouseholdMembers();
      setMembers(list.filter((m) => m.status === "active"));
    } catch (err) {
      if (err instanceof ApiError) {
        setLoadError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setLoadError(t("couldNotLoadMembers"));
      }
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  async function handleAddMember() {
    const name = displayName.trim();
    if (!name) return;
    setAdding(true);
    setAddError(null);
    try {
      await createManagedMember({ displayName: name, role });
      setDisplayName("");
      setShowAddForm(false);
      await refreshMembers();
    } catch (err) {
      if (err instanceof ApiError) {
        setAddError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setAddError(t("couldNotAddMember"));
      }
    } finally {
      setAdding(false);
    }
  }

  function roleLabel(memberRole: string): string {
    const key = ROLE_LABEL_KEYS[memberRole];
    return key ? t(key) : memberRole;
  }

  return (
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.householdMembers}
      atmosphere="kitchen-morning"
      objectPosition="50% 62%"
    >
      <h1
        className="mb-2 text-[2.15rem] font-semibold leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--brand-primary)",
        }}
      >
        {t("householdMembersTitle")}
      </h1>
      <p
        className="mb-5 max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--warm-gray)" }}
      >
        {t("householdMembersBody")}
      </p>

      {loading ? (
        <LoadingState label={t("loading")} />
      ) : loadError ? (
        <ErrorState
          title={t("couldNotLoadMembers")}
          detail={loadError}
          onRetry={() => {
            setLoading(true);
            void refreshMembers();
          }}
          retryLabel={t("retry")}
        />
      ) : (
        <>
          <ul
            className="mb-6 space-y-2"
            aria-label={t("householdMembersTitle")}
          >
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(250, 249, 247, 0.95)",
                  border: "1px solid var(--soft-beige)",
                }}
              >
                <span
                  className="text-base font-medium"
                  style={{ color: "var(--deep-charcoal)" }}
                >
                  {member.displayName}
                  {member.id === auth.memberId ? (
                    <span
                      className="ms-2 text-sm font-normal"
                      style={{ color: "var(--warm-gray)" }}
                    >
                      ({t("youLabel")})
                    </span>
                  ) : null}
                </span>
                <span className="text-sm" style={{ color: "var(--warm-gray)" }}>
                  {roleLabel(member.role)}
                </span>
              </li>
            ))}
          </ul>

          {showAddForm ? (
            <div
              className="mb-6 space-y-3 rounded-2xl p-4"
              style={{
                background: "rgba(250, 249, 247, 0.95)",
                border: "1px solid var(--soft-beige)",
              }}
            >
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("memberDisplayName")}
                className="w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{
                  borderColor: "var(--soft-beige)",
                  color: "var(--deep-charcoal)",
                }}
                maxLength={120}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ManagedMemberRole)}
                className="w-full rounded-xl border px-4 py-3 text-base outline-none"
                style={{
                  borderColor: "var(--soft-beige)",
                  color: "var(--deep-charcoal)",
                }}
                aria-label={t("memberRoleLabel")}
              >
                {MANAGED_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(ROLE_LABEL_KEYS[r]!)}
                  </option>
                ))}
              </select>
              {addError ? (
                <p className="text-sm" style={{ color: "var(--error, #b44)" }}>
                  {addError}
                </p>
              ) : null}
              <div className="flex gap-3">
                <PrimaryButton
                  onClick={() => void handleAddMember()}
                  disabled={adding || !displayName.trim()}
                >
                  {adding ? t("addingMember") : t("addHouseholdMember")}
                </PrimaryButton>
                <TextButton
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError(null);
                  }}
                >
                  {t("back")}
                </TextButton>
              </div>
            </div>
          ) : (
            <TextButton
              onClick={() => setShowAddForm(true)}
              className="mb-6 block py-2"
            >
              + {t("addHouseholdMember")}
            </TextButton>
          )}
        </>
      )}

      <div className="mt-auto space-y-3">
        <PrimaryButton onClick={onContinue} disabled={loading || !!loadError}>
          {t("continue")}
        </PrimaryButton>
        <TextButton onClick={onSkip} className="mx-auto block py-2">
          {t("householdMembersSkip")}
        </TextButton>
      </div>
    </OnboardingScreenLayout>
  );
}
