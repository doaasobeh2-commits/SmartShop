import type { InventoryItem } from "@recipe-ai/core/types";

export function InventoryRow({ item }: { item: InventoryItem }) {
  const isHave = item.status === "have";

  return (
    <div className="flex items-start gap-4 py-5" style={{ borderBottom: "1px solid var(--soft-beige)" }}>
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-sm"
        style={{ color: isHave ? "var(--warm-gray)" : "var(--warm-gray)" }}
        aria-hidden
      >
        {isHave ? "✓" : "○"}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-lg font-medium leading-snug"
          style={{ color: "var(--deep-charcoal)", fontFamily: "var(--font-sans)" }}
        >
          {item.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--warm-gray)" }}>
          {item.freshness ? `${item.freshness} · ${item.detail}` : item.detail}
        </p>
      </div>
    </div>
  );
}
