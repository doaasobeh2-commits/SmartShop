import { AtmosphereScreen, PrimaryButton } from "@recipe-ai/shared";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/useI18n";

type RecipeNotEnabledScreenProps = {
  onSignOut: () => void;
};

export function RecipeNotEnabledScreen({ onSignOut }: RecipeNotEnabledScreenProps) {
  const { user, memberId, memberRole } = useAuth();
  const { t } = useI18n();

  return (
    <AtmosphereScreen atmosphere="kitchen-morning" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16 text-white">
        <h1 className="mb-3 text-4xl font-semibold">{t("recipeNotEnabledTitle")}</h1>
        <p className="mb-4 max-w-sm text-base text-white/85">{t("recipeNotEnabledBody")}</p>
        <div className="mb-8 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
          <div>{user?.displayName}</div>
          <div className="text-white/70">
            {t("memberLabel", {
              id: memberId ?? "—",
              role: memberRole ?? "—",
            })}
          </div>
        </div>
        <PrimaryButton onClick={onSignOut}>{t("signOut")}</PrimaryButton>
      </div>
    </AtmosphereScreen>
  );
}
