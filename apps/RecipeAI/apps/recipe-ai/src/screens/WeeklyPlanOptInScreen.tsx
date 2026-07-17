import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";

type WeeklyPlanOptInScreenProps = {
  onYes: () => void;
  onNotNow: () => void;
};

export function WeeklyPlanOptInScreen({ onYes, onNotNow }: WeeklyPlanOptInScreenProps) {
  const { t } = useI18n();

  return (
    <AtmosphereScreen atmosphere="planning-light" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16">
        <h1 className="meal-title mb-4 text-4xl">{t("planWeekTitle")}</h1>
        <p className="mb-12 max-w-sm text-base leading-relaxed" style={{ color: "var(--warm-gray)" }}>
          {t("planWeekBody")}
        </p>

        <PrimaryButton onClick={onYes} className="mb-4">
          {t("yes")}
        </PrimaryButton>
        <TextButton onClick={onNotNow} className="mx-auto block py-2">
          {t("notNow")}
        </TextButton>
      </div>
    </AtmosphereScreen>
  );
}
