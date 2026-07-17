import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Home,
  LayoutGrid,
  Mail,
  Shield,
  Users,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  implemented: boolean;
};

/** Phase 3 live-data navigation. Legacy mock pages are disabled. */
export const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutGrid,
    href: "/overview",
    implemented: true,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    href: "/users",
    implemented: true,
  },
  {
    id: "households",
    label: "Households",
    icon: Home,
    href: "/households",
    implemented: true,
  },
  {
    id: "invitations",
    label: "Invitations",
    icon: Mail,
    href: "/invitations",
    implemented: true,
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: Shield,
    href: "/sessions",
    implemented: true,
  },
  {
    id: "audit-logs",
    label: "Audit logs",
    icon: ClipboardList,
    href: "/audit-logs",
    implemented: true,
  },
];

/** Former mock-only routes — kept in codebase but not linked. */
export const disabledMockRoutes = [
  "/platform-overview",
  "/household-intelligence",
  "/app-integrations",
  "/intelligence-engines",
  "/signals-logs",
  "/safety-privacy",
  "/roadmap",
] as const;
