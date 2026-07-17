export type PlatformApp =
  | "smartshop"
  | "recipe"
  | "fitness"
  | "core";

export type PermissionValue = "allow" | "deny" | "na";

export type PermissionRow = {
  id: string;
  permission: string;
  description: string;
  access: Record<PlatformApp, PermissionValue>;
  lastModified: string;
  auditHistory: string[];
};

export type GdprRequestType = "DELETE" | "EXPORT";
export type GdprRequestStatus = "Complete" | "Processing" | "Pending";

export type GdprRequest = {
  id: string;
  requestId: string;
  householdId: string;
  type: GdprRequestType;
  status: GdprRequestStatus;
  age: string;
  details: {
    requestedBy: string;
    reason: string;
    scope: string[];
    timeline: string[];
  };
};

export type AllergenSeverity = "Critical" | "Warning" | "Normal";

export type AllergenAlert = {
  id: string;
  householdId: string;
  allergen: string;
  sourceApp: string;
  propagatedTo: string[];
  time: string;
  severity: AllergenSeverity;
  propagationHistory: string[];
};

export const platformColumns: { id: PlatformApp; label: string }[] = [
  { id: "smartshop", label: "SmartShop AI" },
  { id: "recipe", label: "Recipe AI" },
  { id: "fitness", label: "Fitness AI" },
  { id: "core", label: "Core Platform" },
];

export const permissionMatrix: PermissionRow[] = [
  {
    id: "read-household-signals",
    permission: "Read household signals",
    description:
      "Allows reading anonymized household behavioral signals for inference and admin diagnostics.",
    access: {
      smartshop: "allow",
      recipe: "allow",
      fitness: "deny",
      core: "allow",
    },
    lastModified: "2026-07-12 09:14 UTC",
    auditHistory: [
      "2026-07-12 Core: confirmed SmartShop + Recipe read access",
      "2026-06-28 Fitness denied — body signals remain installation-scoped",
    ],
  },
  {
    id: "write-behavioral-signals",
    permission: "Write behavioral signals",
    description:
      "Allows apps to emit behavioral signals into the household intelligence graph.",
    access: {
      smartshop: "allow",
      recipe: "allow",
      fitness: "allow",
      core: "na",
    },
    lastModified: "2026-07-08 15:02 UTC",
    auditHistory: [
      "2026-07-08 Fitness write path enabled for activity sessions",
      "2026-05-19 Core marked N/A — platform aggregates, does not emit app signals",
    ],
  },
  {
    id: "read-taste-profile",
    permission: "Read taste profile",
    description:
      "Allows reading inferred taste, cuisine affinity, and dietary preference vectors.",
    access: {
      smartshop: "deny",
      recipe: "allow",
      fitness: "deny",
      core: "allow",
    },
    lastModified: "2026-07-01 11:40 UTC",
    auditHistory: [
      "2026-07-01 SmartShop denied — shopping uses purchase signals only",
      "2026-04-22 Recipe granted for Tonight ranking",
    ],
  },
  {
    id: "read-nutrition-data",
    permission: "Read nutrition data",
    description:
      "Allows reading nutrition targets, meal intake patterns, and macro confidence scores.",
    access: {
      smartshop: "deny",
      recipe: "allow",
      fitness: "allow",
      core: "allow",
    },
    lastModified: "2026-06-30 18:21 UTC",
    auditHistory: [
      "2026-06-30 Fitness granted for energy expenditure alignment",
      "2026-03-14 SmartShop remains denied — no nutrition UI in shopping surface",
    ],
  },
  {
    id: "read-fitness-data",
    permission: "Read fitness data",
    description:
      "Allows reading activity sessions, recovery signals, and training focus outputs.",
    access: {
      smartshop: "deny",
      recipe: "deny",
      fitness: "allow",
      core: "allow",
    },
    lastModified: "2026-06-18 07:55 UTC",
    auditHistory: [
      "2026-06-18 Recipe denied — meal planning consumes nutrition bridge only",
      "2026-02-09 Fitness granted as owner of body lens data",
    ],
  },
  {
    id: "read-allergen-flags",
    permission: "Read allergen flags",
    description:
      "Allows reading fail-closed allergen flags for safety gating across the household graph.",
    access: {
      smartshop: "allow",
      recipe: "deny",
      fitness: "deny",
      core: "allow",
    },
    lastModified: "2026-07-14 13:08 UTC",
    auditHistory: [
      "2026-07-14 Temporary Recipe read deny under review — propagation still via Core",
      "2026-01-30 SmartShop granted for offer safety filtering",
    ],
  },
  {
    id: "write-allergen-flags",
    permission: "Write allergen flags",
    description:
      "Allows creating or updating household allergen flags. Restricted to Core for consistency.",
    access: {
      smartshop: "deny",
      recipe: "deny",
      fitness: "deny",
      core: "allow",
    },
    lastModified: "2026-07-10 10:00 UTC",
    auditHistory: [
      "2026-07-10 Allergen writes centralized in Core after GDPR review",
      "2026-05-02 App-level write paths revoked",
    ],
  },
  {
    id: "read-purchase-history",
    permission: "Read purchase history",
    description:
      "Allows reading trip-complete baskets and purchase frequency hypotheses.",
    access: {
      smartshop: "allow",
      recipe: "deny",
      fitness: "deny",
      core: "allow",
    },
    lastModified: "2026-06-04 16:33 UTC",
    auditHistory: [
      "2026-06-04 Recipe denied — pantry projections are derived, not raw history",
      "2026-01-11 SmartShop granted as purchase owner",
    ],
  },
  {
    id: "export-household-data",
    permission: "Export household data",
    description:
      "Allows GDPR data export packages. Restricted to Core admin operations.",
    access: {
      smartshop: "deny",
      recipe: "deny",
      fitness: "deny",
      core: "allow",
    },
    lastModified: "2026-07-15 08:12 UTC",
    auditHistory: [
      "2026-07-15 Export pipeline verified for REQ-0480",
      "2026-03-01 App exports blocked by policy",
    ],
  },
  {
    id: "delete-household-data",
    permission: "Delete household data",
    description:
      "Allows irreversible household deletion under GDPR erase requests. Core only.",
    access: {
      smartshop: "deny",
      recipe: "deny",
      fitness: "deny",
      core: "allow",
    },
    lastModified: "2026-07-16 19:45 UTC",
    auditHistory: [
      "2026-07-16 Delete workflow completed for REQ-0481",
      "2026-03-01 App deletes blocked by policy",
    ],
  },
];

export const gdprRequests: GdprRequest[] = [
  {
    id: "gdpr-1",
    requestId: "REQ-0481",
    householdId: "HH-3821",
    type: "DELETE",
    status: "Complete",
    age: "2 days ago",
    details: {
      requestedBy: "household-owner",
      reason: "Right to erasure",
      scope: ["signals", "profiles", "exports", "audit mirrors"],
      timeline: [
        "Day 0 Request received",
        "Day 0 Verification complete",
        "Day 1 Cascading delete executed",
        "Day 2 Confirmation issued",
      ],
    },
  },
  {
    id: "gdpr-2",
    requestId: "REQ-0480",
    householdId: "HH-7102",
    type: "EXPORT",
    status: "Processing",
    age: "1 day ago",
    details: {
      requestedBy: "household-owner",
      reason: "Data portability",
      scope: ["purchase signals", "taste profile", "meal history"],
      timeline: [
        "Day 0 Request received",
        "Day 0 Scope compiled",
        "Day 1 Package generation in progress",
      ],
    },
  },
  {
    id: "gdpr-3",
    requestId: "REQ-0479",
    householdId: "HH-5544",
    type: "DELETE",
    status: "Complete",
    age: "3 days ago",
    details: {
      requestedBy: "household-owner",
      reason: "Right to erasure",
      scope: ["all household graph nodes"],
      timeline: [
        "Day 0 Request received",
        "Day 1 Delete executed",
        "Day 3 Retention purge confirmed",
      ],
    },
  },
  {
    id: "gdpr-4",
    requestId: "REQ-0478",
    householdId: "HH-9001",
    type: "EXPORT",
    status: "Complete",
    age: "5 days ago",
    details: {
      requestedBy: "household-owner",
      reason: "Data portability",
      scope: ["signals", "allergen flags", "locale policy"],
      timeline: [
        "Day 0 Request received",
        "Day 1 Package ready",
        "Day 2 Download acknowledged",
      ],
    },
  },
  {
    id: "gdpr-5",
    requestId: "REQ-0477",
    householdId: "HH-2208",
    type: "EXPORT",
    status: "Pending",
    age: "6 hours ago",
    details: {
      requestedBy: "household-owner",
      reason: "Data portability",
      scope: ["fitness sessions", "nutrition targets"],
      timeline: ["Day 0 Request queued for identity verification"],
    },
  },
];

export const allergenAlerts: AllergenAlert[] = [
  {
    id: "alg-1",
    householdId: "HH-3309",
    allergen: "Gluten",
    sourceApp: "SmartShop",
    propagatedTo: ["Recipe AI"],
    time: "1h ago",
    severity: "Critical",
    propagationHistory: [
      "SmartShop flagged gluten from basket scan",
      "Core validated allergen write",
      "Recipe AI received fail-closed gate update",
    ],
  },
  {
    id: "alg-2",
    householdId: "HH-7823",
    allergen: "Nuts",
    sourceApp: "Recipe AI",
    propagatedTo: ["SmartShop", "Core"],
    time: "3h ago",
    severity: "Critical",
    propagationHistory: [
      "Recipe AI allergen confirmation during cook prep",
      "Core mirrored flag to household graph",
      "SmartShop suppressed nut-containing offers",
    ],
  },
  {
    id: "alg-3",
    householdId: "HH-1042",
    allergen: "Dairy",
    sourceApp: "Core",
    propagatedTo: ["Recipe AI", "Fitness AI"],
    time: "5h ago",
    severity: "Warning",
    propagationHistory: [
      "Core admin correction applied",
      "Recipe AI updated Tonight safety filter",
      "Fitness AI noted dietary constraint for recovery meals",
    ],
  },
  {
    id: "alg-4",
    householdId: "HH-5517",
    allergen: "Shellfish",
    sourceApp: "Recipe AI",
    propagatedTo: ["Core"],
    time: "8h ago",
    severity: "Normal",
    propagationHistory: [
      "Recipe AI member confirmation captured",
      "Core stored canonical allergen flag",
    ],
  },
];

export const appLabels: Record<PlatformApp, string> = {
  smartshop: "SmartShop AI",
  recipe: "Recipe AI",
  fitness: "Fitness AI",
  core: "Core Platform",
};
