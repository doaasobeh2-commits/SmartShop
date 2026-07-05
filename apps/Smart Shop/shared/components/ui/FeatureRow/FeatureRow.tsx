export type FeatureRowProps = {
  emoji: string;
  label: string;
};

export function FeatureRow({ emoji, label }: FeatureRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-xs font-semibold text-foreground">{label}</p>
    </div>
  );
}
