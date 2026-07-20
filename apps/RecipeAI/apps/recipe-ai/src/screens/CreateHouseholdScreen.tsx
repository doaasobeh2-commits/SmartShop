import { useState, type FormEvent } from "react";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { ApiError } from "../api/client";
import {
  createHousehold,
  enrollMember,
  fetchMe,
  type AddressInput,
} from "../api/coreApi";
import { useAuth } from "../auth/AuthContext";
import { ErrorState, mapApiErrorMessage } from "../components/AsyncStates";
import { useI18n } from "../i18n/useI18n";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";

type CreateHouseholdScreenProps = {
  initialAddress?: Partial<AddressInput>;
  onBack: () => void;
  onCreated: () => void;
};

const emptyAddress: AddressInput = {
  countryCode: "AT",
  postalCode: "",
  city: "",
  street: "",
  houseNumber: "",
  unit: "",
};

export function CreateHouseholdScreen({
  initialAddress,
  onBack,
  onCreated,
}: CreateHouseholdScreenProps) {
  const auth = useAuth();
  const { t, locale } = useI18n();
  const [name, setName] = useState(() =>
    auth.user ? t("kitchenNameDefault", { name: auth.user.displayName }) : "",
  );
  const [address, setAddress] = useState<AddressInput>({
    ...emptyAddress,
    ...initialAddress,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patchAddress(partial: Partial<AddressInput>) {
    setAddress((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const unit = address.unit?.trim();
      await createHousehold({
        name: name.trim(),
        preferredLocale: locale,
        address: {
          countryCode: address.countryCode.trim().toUpperCase(),
          postalCode: address.postalCode.trim(),
          city: address.city.trim(),
          street: address.street.trim(),
          houseNumber: address.houseNumber.trim(),
          ...(unit ? { unit } : {}),
        },
      });
      await auth.refresh();
      const me = await fetchMe();
      if (me.memberId) {
        try {
          await enrollMember(me.memberId, { applicationKey: "recipe" });
        } catch (enrollErr) {
          // Owner may already be enrolled, or policy may block — refresh still.
          if (!(enrollErr instanceof ApiError && enrollErr.status === 409)) {
            throw enrollErr;
          }
        }
        await auth.refresh();
      }
      onCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setError(t("couldNotCreateHousehold"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AtmosphereScreen
      atmosphere="kitchen-morning"
      contentLayout="scroll"
      imageUrl={ONBOARDING_HERO_IMAGES.householdHub}
    >
      <form
        onSubmit={onSubmit}
        className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16 text-white"
      >
        <h1 className="mb-3 text-4xl font-semibold">
          {t("createHouseholdTitle")}
        </h1>
        <p className="mb-6 max-w-sm text-base text-white/85">
          {t("createHouseholdBody")}
        </p>

        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder={t("familyName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t("country")}
              value={address.countryCode}
              onChange={(e) => patchAddress({ countryCode: e.target.value })}
              maxLength={2}
              className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
              required
            />
            <input
              type="text"
              placeholder={t("postalCode")}
              value={address.postalCode}
              onChange={(e) => patchAddress({ postalCode: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
              required
            />
          </div>
          <input
            type="text"
            placeholder={t("city")}
            value={address.city}
            onChange={(e) => patchAddress({ city: e.target.value })}
            className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
            required
          />
          <input
            type="text"
            placeholder={t("street")}
            value={address.street}
            onChange={(e) => patchAddress({ street: e.target.value })}
            className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t("houseNumber")}
              value={address.houseNumber}
              onChange={(e) => patchAddress({ houseNumber: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
              required
            />
            <input
              type="text"
              placeholder={t("unitOptional")}
              value={address.unit ?? ""}
              onChange={(e) => patchAddress({ unit: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
            />
          </div>
        </div>

        {error ? (
          <div className="mb-4">
            <ErrorState title={t("couldNotCreateHousehold")} detail={error} />
          </div>
        ) : null}

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? t("saving") : t("createAndContinue")}
        </PrimaryButton>
        <div className="mt-3">
          <TextButton type="button" onClick={onBack}>
            {t("back")}
          </TextButton>
        </div>
      </form>
    </AtmosphereScreen>
  );
}
