import { Check, Circle, X } from "lucide-react";
import type { PermissionValue } from "../data/safetyPrivacy";

type PermissionCellProps = {
  value: PermissionValue;
};

export function PermissionCell({ value }: PermissionCellProps) {
  if (value === "allow") {
    return (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-soft text-success"
        title="Allowed"
        aria-label="Allowed"
      >
        <Check size={14} strokeWidth={2.5} />
      </span>
    );
  }

  if (value === "deny") {
    return (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF1F6] text-slate-icon"
        title="Denied"
        aria-label="Denied"
      >
        <X size={14} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center text-[#C5CAD6]"
      title="Not applicable"
      aria-label="Not applicable"
    >
      <Circle size={18} strokeWidth={1.5} />
    </span>
  );
}
