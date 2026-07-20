import { useState, type FormEvent } from "react";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { ApiError } from "../api/client";
import {
  createJoinRequest,
  discoverAddress,
  type AddressInput,
} from "../api/coreApi";
import { ErrorState, mapApiErrorMessage } from "../components/AsyncStates";
import { useI18n } from "../i18n/useI18n";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";

type AddressDiscoverScreenProps = {
  onBack: () => void;
  onJoinRequested: () => void;
  onCreateSeparate: (address: AddressInput) => void;
};

type Phase = "form" | "match" | "no-match";

export function AddressDiscoverScreen({
  onBack,
  onJoinRequested,
  onCreateSeparate,
}: AddressDiscoverScreenProps) {
  const { t, locale } = useI18n();
  const [address, setAddress] = useState<AddressInput>({
    countryCode: "AT",
    postalCode: "",
    city: "",
    street: "",
    houseNumber: "",
    unit: "",
  });
  const [phase, setPhase] = useState<Phase>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patchAddress(partial: Partial<AddressInput>) {
    setAddress((prev) => ({ ...prev, ...partial }));
  }

  function normalizedAddress(): AddressInput {
    const unit = address.unit?.trim();
    return {
      countryCode: address.countryCode.trim().toUpperCase(),
      postalCode: address.postalCode.trim(),
      city: address.city.trim(),
      street: address.street.trim(),
      houseNumber: address.houseNumber.trim(),
      ...(unit ? { unit } : {}),
    };
  }

  async function onDiscover(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await discoverAddress(normalizedAddress());
      setPhase(result.possibleMatch ? "match" : "no-match");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setError(t("couldNotCheckAddress"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onRequestJoin() {
    setSubmitting(true);
    setError(null);
    try {
      await createJoinRequest(normalizedAddress());
      onJoinRequested();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setError(t("couldNotSendJoin"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "match") {
    return (
      <AtmosphereScreen
        atmosphere="kitchen-morning"
        contentLayout="bottom"
        imageUrl={ONBOARDING_HERO_IMAGES.householdHub}
      >
        <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16 text-white">
          <h1 className="mb-3 text-3xl font-semibold leading-tight">
            {t("possibleFamilyTitle")}
          </h1>
          <p className="mb-4 max-w-sm text-base leading-relaxed text-white/85">
            {t("possibleFamilyBody")}
          </p>
          <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/75">
            {t("possibleFamilySecurity")}
          </p>

          {error ? (
            <div className="mb-4">
              <ErrorState title={t("couldNotContinue")} detail={error} />
            </div>
          ) : null}

          <div className="space-y-3">
            <PrimaryButton
              onClick={() => void onRequestJoin()}
              disabled={submitting}
            >
              {submitting ? t("sending") : t("requestToJoin")}
            </PrimaryButton>
            <TextButton
              onClick={() => onCreateSeparate(normalizedAddress())}
              disabled={submitting}
            >
              {t("createSeparateFamily")}
            </TextButton>
            <button
              type="button"
              className="w-full pt-1 text-center text-sm text-white/75 underline"
              onClick={() => {
                setPhase("form");
                setError(null);
              }}
            >
              {t("notMyFamily")}
            </button>
          </div>
        </div>
      </AtmosphereScreen>
    );
  }

  return (
    <AtmosphereScreen
      atmosphere="kitchen-morning"
      contentLayout="scroll"
      imageUrl={ONBOARDING_HERO_IMAGES.householdHub}
    >
      <form
        onSubmit={onDiscover}
        className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16 text-white"
      >
        <h1 className="mb-3 text-4xl font-semibold">{t("joinAddressTitle")}</h1>
        <p className="mb-6 max-w-sm text-base text-white/85">
          {t("joinAddressBody")}
        </p>

        {phase === "no-match" ? (
          <div className="mb-4 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
            {t("noFamilyMatch")}
          </div>
        ) : null}

        <div className="mb-6 space-y-3">
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
            <ErrorState title={t("couldNotContinue")} detail={error} />
          </div>
        ) : null}

        {phase === "no-match" ? (
          <div className="space-y-3">
            <PrimaryButton
              type="button"
              onClick={() => onCreateSeparate(normalizedAddress())}
            >
              {t("createWithAddress")}
            </PrimaryButton>
            <TextButton type="button" onClick={() => setPhase("form")}>
              {t("editAddress")}
            </TextButton>
          </div>
        ) : (
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? t("checking") : t("continue")}
          </PrimaryButton>
        )}
        <div className="mt-3">
          <TextButton type="button" onClick={onBack}>
            {t("back")}
          </TextButton>
        </div>
      </form>
    </AtmosphereScreen>
  );
}
