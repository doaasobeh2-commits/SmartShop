import { imageObjectPosition } from "../data/imageFocalPoints";

type CuisinePreferenceCardProps = {
  label: string;
  imageUrl: string;
  selected: boolean;
  disabled?: boolean;
  /** Primary home cuisine cards vs optional preferred cards */
  tier?: "primary" | "secondary";
  onToggle: () => void;
};

export function CuisinePreferenceCard({
  label,
  imageUrl,
  selected,
  disabled = false,
  tier = "primary",
  onToggle,
}: CuisinePreferenceCardProps) {
  const position = imageObjectPosition(imageUrl);
  const isSecondary = tier === "secondary";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-disabled={disabled}
      className="overflow-hidden rounded-2xl text-start transition-transform active:scale-[0.98]"
      style={{
        border: selected
          ? `2px solid var(--brand-primary)`
          : "1.5px solid rgba(240, 237, 232, 0.95)",
        boxShadow: selected
          ? "0 6px 18px rgba(90, 64, 48, 0.14)"
          : isSecondary
            ? "0 4px 12px rgba(58, 36, 22, 0.03)"
            : "0 8px 20px rgba(58, 36, 22, 0.05)",
        background: isSecondary
          ? "rgba(255, 253, 249, 0.88)"
          : "rgba(255, 253, 249, 0.96)",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div
        className={`relative w-full overflow-hidden ${isSecondary ? "aspect-[4/3]" : "aspect-[5/4]"}`}
      >
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: position,
          }}
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{
            background:
              "linear-gradient(to top, rgba(58, 36, 22, 0.22), transparent 75%)",
          }}
          aria-hidden
        />
        {selected ? (
          <span
            className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
            style={{
              background: "var(--brand-primary)",
              color: "var(--warm-white)",
            }}
            aria-hidden
          >
            ✓
          </span>
        ) : null}
      </div>
      <p
        className={`px-2.5 py-2 font-medium leading-snug ${isSecondary ? "text-xs" : "text-sm"}`}
        style={{
          color: selected ? "var(--brand-primary)" : "var(--deep-charcoal)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </p>
    </button>
  );
}
