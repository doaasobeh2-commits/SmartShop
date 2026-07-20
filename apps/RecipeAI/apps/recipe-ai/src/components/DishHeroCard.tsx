import { ResponsiveDishImage } from "./DishImageSurface";
import { CONTENT_SURFACE } from "./livingKitchenVisual";

type DishHeroCardProps = {
  title: string;
  imageUrl: string;
  prepMinutes: number;
  cuisine: string;
  reason: string;
  servings?: number;
  minutesCuisineLabel: string;
  servingsLabel?: string;
};

export function DishHeroCard({
  title,
  imageUrl,
  reason,
  servings,
  minutesCuisineLabel,
  servingsLabel,
}: DishHeroCardProps) {
  return (
    <article
      className="overflow-hidden rounded-[1.35rem]"
      style={{
        ...CONTENT_SURFACE,
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.65) inset, 0 14px 36px rgba(58, 36, 22, 0.08)",
      }}
    >
      <div className="relative w-full overflow-hidden">
        <ResponsiveDishImage imageUrl={imageUrl} alt={title} preset="hero" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
          style={{
            background:
              "linear-gradient(to top, rgba(58, 36, 22, 0.14) 0%, transparent 100%)",
          }}
        />
      </div>
      <div className="px-4 pb-4 pt-3.5">
        <h1
          className="mb-1.5 text-[1.65rem] font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--brand-primary)",
          }}
        >
          {title}
        </h1>
        <p className="mb-2 text-sm" style={{ color: "var(--warm-gray)" }}>
          {minutesCuisineLabel}
          {servings && servingsLabel ? ` · ${servingsLabel}` : null}
        </p>
        <p
          className="text-[0.95rem] leading-relaxed"
          style={{ color: "var(--deep-charcoal)" }}
        >
          {reason}
        </p>
      </div>
    </article>
  );
}
