import type { FormEvent } from "react";
import type { CuisineFamilyId } from "@recipe-ai/core/types";
import { getCuisineOnboardingOptions } from "../data/cuisineOnboarding";
import type { DraftCreationInput } from "./recipeStudioTypes";

type AdminNewRecipeDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: DraftCreationInput) => void;
};

export function AdminNewRecipeDialog({
  open,
  onClose,
  onCreate,
}: AdminNewRecipeDialogProps) {
  if (!open) return null;

  const cuisines = getCuisineOnboardingOptions("en");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const dishName = String(form.get("dishName") ?? "").trim();
    const cuisineFamilyId = String(form.get("cuisine") ?? "arab") as CuisineFamilyId;
    const regionSubcuisine = String(form.get("region") ?? "").trim() || undefined;
    const adminNote = String(form.get("adminNote") ?? "").trim() || undefined;
    if (!dishName) return;
    onCreate({ dishName, cuisineFamilyId, regionSubcuisine, adminNote });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(26, 25, 24, 0.45)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-recipe-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border p-5 shadow-lg"
        style={{
          borderColor: "var(--soft-beige)",
          background: "var(--warm-white)",
        }}
      >
        <div>
          <h2
            id="new-recipe-title"
            className="text-lg font-semibold"
            style={{ color: "var(--brand-primary)" }}
          >
            New recipe (minimal input)
          </h2>
          <p className="mt-1 text-xs" style={{ color: "var(--warm-gray)" }}>
            Enter dish name and cuisine only. AI generation can populate full
            draft content later. Starts as Recipe QA Draft + Photo QA Pending.
          </p>
        </div>

        <label className="block text-xs">
          Dish name *
          <input
            name="dishName"
            required
            autoFocus
            placeholder="e.g. Baba Ghanouj"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--soft-beige)" }}
          />
        </label>

        <label className="block text-xs">
          Cuisine *
          <select
            name="cuisine"
            defaultValue="arab"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--soft-beige)" }}
          >
            {cuisines.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs">
          Region / subcuisine (optional)
          <input
            name="region"
            placeholder="e.g. Levantine, Palestinian"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--soft-beige)" }}
          />
        </label>

        <label className="block text-xs">
          Admin note (optional)
          <textarea
            name="adminNote"
            rows={2}
            placeholder="Context for AI generation or QA review"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--soft-beige)" }}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm"
            style={{ borderColor: "var(--soft-beige)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Create draft
          </button>
        </div>
      </form>
    </div>
  );
}
