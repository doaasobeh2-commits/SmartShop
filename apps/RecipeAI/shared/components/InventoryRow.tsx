import type { InventoryItem } from "@recipe-ai/core/types";

export function InventoryRow({ item }: { item: InventoryItem }) {
  const isHave = item.status === "have";

  return (
    <div
      className="flex items-start gap-3 py-3.5"
      style={{ borderBottom: "1px solid var(--soft-beige)" }}
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-sm"
        style={{ color: isHave ? "var(--success)" : "var(--accent)" }}
        aria-hidden
      >
        {isHave ? "✓" : "○"}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-base font-medium leading-snug"
          style={{
            color: "var(--deep-charcoal)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {item.name}
        </p>
        <p
          className="mt-0.5 text-sm leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {item.freshness ? `${item.freshness} · ${item.detail}` : item.detail}
        </p>
      </div>
    </div>
  );
}
