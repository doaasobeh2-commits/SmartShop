import { AtmosphereScreen, PrimaryButton } from "@recipe-ai/shared";

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <AtmosphereScreen atmosphere="kitchen-morning" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16">
        <div className="mb-8 text-center text-white">
          <h1
            className="mb-3 text-5xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recipe AI
          </h1>

          <p className="mx-auto max-w-xs text-lg leading-relaxed text-white/85">
            Smart recipes. Made for your life.
          </p>
        </div>

        <PrimaryButton onClick={onContinue}>Let&apos;s cook →</PrimaryButton>
      </div>
    </AtmosphereScreen>
  );
}