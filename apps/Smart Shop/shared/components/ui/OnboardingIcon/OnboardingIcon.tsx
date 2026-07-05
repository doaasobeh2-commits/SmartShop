export type OnboardingIconProps = {
  emoji: string;
};

export function OnboardingIcon({ emoji }: OnboardingIconProps) {
  return (
    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-primary-30 bg-primary-15">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
    </div>
  );
}
