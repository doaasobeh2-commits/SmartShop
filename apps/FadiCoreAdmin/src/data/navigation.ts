import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Cpu,
  Home,
  LayoutGrid,
  Link2,
  Map,
  Shield,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  implemented: boolean;
};

export const navItems: NavItem[] = [
  {
    id: "platform-overview",
    label: "Platform Overview",
    icon: LayoutGrid,
    href: "/platform-overview",
    implemented: true,
  },
  {
    id: "household-intel",
    label: "Household Intel",
    icon: Home,
    href: "/household-intelligence",
    implemented: true,
  },
  {
    id: "app-integrations",
    label: "App Integrations",
    icon: Link2,
    href: "/app-integrations",
    implemented: true,
  },
  {
    id: "intelligence-engines",
    label: "Intelligence Engines",
    icon: Cpu,
    href: "/intelligence-engines",
    implemented: true,
  },
  {
    id: "signals-logs",
    label: "Signals & Logs",
    icon: Activity,
    href: "/signals-logs",
    implemented: true,
  },
  {
    id: "safety-privacy",
    label: "Safety & Privacy",
    icon: Shield,
    href: "/safety-privacy",
    implemented: true,
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: Map,
    href: "/roadmap",
    implemented: true,
  },
];
