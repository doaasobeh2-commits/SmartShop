export type SearchHit = {
  id: string;
  label: string;
  href: string;
  meta: string;
};

export const searchIndex: SearchHit[] = [
  {
    id: "po",
    label: "Platform Overview",
    href: "/platform-overview",
    meta: "Status · KPIs · alerts",
  },
  {
    id: "hi",
    label: "Household Intelligence",
    href: "/household-intelligence",
    meta: "Signals · confidence · taste",
  },
  {
    id: "ai",
    label: "App Integrations",
    href: "/app-integrations",
    meta: "APIs · sync · endpoints",
  },
  {
    id: "engines",
    label: "Intelligence Engines",
    href: "/intelligence-engines",
    meta: "Confidence · rules · reinforcement",
  },
  {
    id: "signals",
    label: "Signals & Logs",
    href: "/signals-logs",
    meta: "Behavioral signals · inference log",
  },
  {
    id: "safety",
    label: "Safety & Privacy",
    href: "/safety-privacy",
    meta: "Permissions · GDPR · allergens",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    href: "/roadmap",
    meta: "Modules · milestones · future apps",
  },
  {
    id: "hh-7823",
    label: "HH-7823",
    href: "/signals-logs",
    meta: "Anonymized household signals",
  },
  {
    id: "smartshop",
    label: "SmartShop AI signals",
    href: "/app-integrations",
    meta: "847 signals/hr",
  },
  {
    id: "fitness-latency",
    label: "Fitness AI sync latency",
    href: "/app-integrations",
    meta: "DEGRADED · 3 errors",
  },
  {
    id: "fitness-engine",
    label: "Fitness Engine",
    href: "/intelligence-engines",
    meta: "74% confidence · degraded",
  },
  {
    id: "sig-88291",
    label: "SIG-88291",
    href: "/signals-logs",
    meta: "PURCHASE · HH-7823",
  },
  {
    id: "req-0480",
    label: "REQ-0480",
    href: "/safety-privacy",
    meta: "GDPR export · processing",
  },
  {
    id: "sleep-ai",
    label: "Sleep AI",
    href: "/roadmap",
    meta: "Future module · Q3 2026",
  },
];
