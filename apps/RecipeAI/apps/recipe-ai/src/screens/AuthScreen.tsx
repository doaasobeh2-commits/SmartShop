import { AtmosphereScreen, PrimaryButton } from "@recipe-ai/shared";

type AuthScreenProps = {
  onContinue: () => void;
};

export function AuthScreen({ onContinue }: AuthScreenProps) {
  return (
    <AtmosphereScreen atmosphere="kitchen-morning" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16">
        <div className="mb-8 text-center text-white">
          <h1 className="mb-3 text-4xl font-semibold">Create your account</h1>

          <p className="mx-auto max-w-xs text-base leading-relaxed text-white/85">
            Save your preferences and personalize your cooking experience.
          </p>
        </div>

        <div className="mb-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
          />
        </div>

        <PrimaryButton onClick={onContinue}>Continue →</PrimaryButton>
      </div>
    </AtmosphereScreen>
  );
}