import { useMemo, useState } from "react";
import {
  AdminTopBar,
  AllergenSafetyLog,
  GDPRRequestList,
  PermissionMatrix,
} from "../components";
import {
  allergenAlerts,
  gdprRequests,
  permissionMatrix,
} from "../data/safetyPrivacy";

type ExpandedTarget =
  | { kind: "permission"; id: string }
  | { kind: "gdpr"; id: string }
  | { kind: "allergen"; id: string }
  | null;

export function SafetyPrivacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<ExpandedTarget>(null);

  const q = searchQuery.trim().toLowerCase();

  const filteredPermissions = useMemo(() => {
    if (!q) return permissionMatrix;
    return permissionMatrix.filter((row) => {
      return (
        row.permission.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [q]);

  const filteredGdpr = useMemo(() => {
    if (!q) return gdprRequests;
    return gdprRequests.filter((request) => {
      return (
        request.requestId.toLowerCase().includes(q) ||
        request.householdId.toLowerCase().includes(q) ||
        request.type.toLowerCase().includes(q) ||
        request.status.toLowerCase().includes(q) ||
        request.age.toLowerCase().includes(q)
      );
    });
  }, [q]);

  const filteredAllergens = useMemo(() => {
    if (!q) return allergenAlerts;
    return allergenAlerts.filter((alert) => {
      return (
        alert.householdId.toLowerCase().includes(q) ||
        alert.allergen.toLowerCase().includes(q) ||
        alert.sourceApp.toLowerCase().includes(q) ||
        alert.propagatedTo.join(" ").toLowerCase().includes(q) ||
        alert.severity.toLowerCase().includes(q) ||
        alert.time.toLowerCase().includes(q)
      );
    });
  }, [q]);

  const permissionExpandedId =
    expanded?.kind === "permission" &&
    filteredPermissions.some((row) => row.id === expanded.id)
      ? expanded.id
      : null;

  const gdprExpandedId =
    expanded?.kind === "gdpr" &&
    filteredGdpr.some((request) => request.id === expanded.id)
      ? expanded.id
      : null;

  const allergenExpandedId =
    expanded?.kind === "allergen" &&
    filteredAllergens.some((alert) => alert.id === expanded.id)
      ? expanded.id
      : null;

  function toggle(
    kind: "permission" | "gdpr" | "allergen",
    id: string,
  ) {
    setExpanded((current) =>
      current?.kind === kind && current.id === id ? null : { kind, id },
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <AdminTopBar
        crumb="Fadi Core Admin"
        section="Safety & Privacy"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search permissions, GDPR, allergens..."
        searchMode="filter"
      />

      <section className="mt-6">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-navy-ink sm:text-[28px]">
          Safety & Privacy
        </h1>
        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-slate-body">
          Data permissions, GDPR controls, allergen safety propagation, and
          admin access audit log.
        </p>
      </section>

      <section className="mt-6">
        <PermissionMatrix
          rows={filteredPermissions}
          expandedId={permissionExpandedId}
          onToggle={(id) => toggle("permission", id)}
        />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GDPRRequestList
          requests={filteredGdpr}
          expandedId={gdprExpandedId}
          onToggle={(id) => toggle("gdpr", id)}
        />
        <AllergenSafetyLog
          alerts={filteredAllergens}
          expandedId={allergenExpandedId}
          onToggle={(id) => toggle("allergen", id)}
        />
      </section>
    </main>
  );
}
