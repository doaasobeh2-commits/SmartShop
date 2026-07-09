import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FIGMA_CANDIDATES = [
  path.join(ROOT, "scripts/figma-source.txt"),
  "C:/Users/fadis/.cursor/projects/c-Users-fadis-Desktop-CUsers-Projects-Projects-Fadi-Core-Platform-apps-FitnessAI/agent-tools/a74172b5-20c5-46b7-a640-9c9ac613e9fc.txt",
];
const FIGMA = FIGMA_CANDIDATES.find((p) => fs.existsSync(p));
if (!FIGMA) throw new Error("Figma source file not found");

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

let src = fs.readFileSync(FIGMA, "utf8");

// Remove StatusBar component and all usages
src = src.replace(/function StatusBar[\s\S]*?\}\n\n/, "");
src = src.replace(/\s*<StatusBar\s*\/?>\s*\n/g, "\n");
src = src.replace(/\s*<StatusBar[^>]*\/>\s*\n/g, "\n");

// Remove unused AppHeader
src = src.replace(/\/\/ ─── Screen Header[\s\S]*?^}\n\n/m, "");

// Remove default export App and BottomNav from source (we rebuild App.tsx)
const appStart = src.indexOf("// ─── App ───");
const bottomNavStart = src.indexOf("// ─── Bottom Navigation ───");
if (appStart > 0 && bottomNavStart > appStart) {
  src = src.slice(0, bottomNavStart);
}

function extractBetween(startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  const end = endMarker ? src.indexOf(endMarker, start + startMarker.length) : src.length;
  if (start < 0) throw new Error(`Missing marker: ${startMarker}`);
  return src.slice(start, end < 0 ? src.length : end).trim();
}

const typesBlock = extractBetween("// ─── Types", "// ─── i18n");
const i18nBlock = extractBetween("// ─── i18n", "// ─── Mock Data");
const mockBlock = extractBetween("// ─── Mock Data", "// ─── Design helpers");
const designBlock = extractBetween("// ─── Design helpers", "// ─── Shared Components");
const sharedComponentsBlock = extractBetween("// ─── Shared Components", "// ─── Welcome Screen");

write(
  "core/src/types/index.ts",
  `export type AppScreen = "dashboard" | "nutrition" | "workout" | "ai" | "progress" | "analytics" | "health" | "premium" | "profile";
export type Lang = "en" | "ar" | "de";
export type FlowScreen = "00-welcome" | "01-onboarding" | "02-auth";
`,
);

write(
  "core/src/constants/index.ts",
  `export const APP_VERSION = "2.4.1";\nexport const APP_MAX_WIDTH = "430px";\n`,
);

write(
  "core/src/routes/index.ts",
  `import type { AppScreen, FlowScreen } from "../types";

export const FLOW_SCREENS = ["00-welcome", "01-onboarding", "02-auth"] as const satisfies readonly FlowScreen[];

export const APP_TAB_SCREENS = [
  "05-dashboard",
  "06-nutrition",
  "07-workout",
  "08-ai-coach",
  "13-profile",
] as const;

export const SECONDARY_SCREENS = [
  "09-progress",
  "10-analytics",
  "11-health",
  "12-premium",
] as const;

export type FlowRouteName = FlowScreen;
export type AppTabRouteName = (typeof APP_TAB_SCREENS)[number];
export type SecondaryRouteName = (typeof SECONDARY_SCREENS)[number];
export type AppRouteName = AppTabRouteName | SecondaryRouteName;

export const FLOW_TO_LEGACY: Record<FlowScreen, "welcome" | "onboarding" | "auth"> = {
  "00-welcome": "welcome",
  "01-onboarding": "onboarding",
  "02-auth": "auth",
};

export const LEGACY_APP_SCREEN: Record<AppRouteName, AppScreen> = {
  "05-dashboard": "dashboard",
  "06-nutrition": "nutrition",
  "07-workout": "workout",
  "08-ai-coach": "ai",
  "09-progress": "progress",
  "10-analytics": "analytics",
  "11-health": "health",
  "12-premium": "premium",
  "13-profile": "profile",
};

export const APP_SCREEN_TO_ROUTE: Record<AppScreen, AppRouteName> = {
  dashboard: "05-dashboard",
  nutrition: "06-nutrition",
  workout: "07-workout",
  ai: "08-ai-coach",
  progress: "09-progress",
  analytics: "10-analytics",
  health: "11-health",
  premium: "12-premium",
  profile: "13-profile",
};
`,
);

write("core/src/index.ts", `export * from "./types";\nexport * from "./constants";\nexport * from "./routes";\n`);

write(
  "shared/i18n/translations.ts",
  i18nBlock.replace("// ─── i18n ─────────────────────────────────────────────────────────────────────\n", "").trim() + "\n",
);

write(
  "shared/mock/data.ts",
  mockBlock.replace("// ─── Mock Data ─────────────────────────────────────────────────────────────────\n", "").trim() + "\n",
);

write(
  "shared/styles/design.ts",
  designBlock
    .replace("// ─── Design helpers ───────────────────────────────────────────────────────────\n", "")
    .replace(/const GLASS_HOVER[\s\S]*?\};\n\n/, "")
    .trim() + "\n",
);

const componentNames = [
  "GCard",
  "GBtn",
  "ProgressRing",
  "MetricPill",
  "SectionHeader",
  "Tag",
  "Switch",
];

function extractFunction(name, text) {
  const sig = `function ${name}`;
  const start = text.indexOf(sig);
  if (start < 0) return null;

  let i = start + sig.length;
  let parenDepth = 0;
  let foundParen = false;
  for (; i < text.length; i++) {
    if (text[i] === "(") {
      parenDepth++;
      foundParen = true;
    }
    if (text[i] === ")") {
      parenDepth--;
      if (foundParen && parenDepth === 0) {
        i++;
        break;
      }
    }
  }

  while (i < text.length && text[i] !== "{") i++;
  if (text[i] !== "{") return null;

  let depth = 0;
  for (; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

for (const name of componentNames) {
  let body = extractFunction(name, sharedComponentsBlock);
  if (!body) throw new Error(`Component not found: ${name}`);
  if (name === "GBtn") {
    body = body.replace(
      "className?: string; outline?: boolean; sm?: boolean;",
      "className?: string; outline?: boolean; sm?: boolean; style?: CSSProperties;",
    );
    body = body.replace(
      'className = "", outline = false, sm = false',
      'className = "", outline = false, sm = false, style = {}',
    );
    body = body.replace(
      'className={`${base} text-white ${className}`}\n      style={{ background: GRAD, boxShadow: "0 4px 24px rgba(0,102,255,0.35)" }}>',
      'className={`${base} text-white ${className}`}\n      style={{ background: GRAD, boxShadow: "0 4px 24px rgba(0,102,255,0.35)", ...style }}>',
    );
  }
  write(
    `shared/components/fitness/${name}.tsx`,
    `import type { CSSProperties, ReactNode } from "react";\nimport { GLASS, GRAD } from "../../styles/design";\n\nexport ${body.replace(/^function /, "function ")}\n`,
  );
}

write(
  "shared/components/layout/AppShell/AppShell.tsx",
  `import type { HTMLAttributes, ReactNode } from "react";

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  footer?: ReactNode;
};

export function AppShell({ children, footer, className = "", ...props }: AppShellProps) {
  return (
    <div
      className={\`relative mx-auto flex h-[var(--app-height)] w-full min-w-0 max-w-[var(--app-max-width)] flex-col overflow-hidden bg-background \${className}\`}
      {...props}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)]">
        {children}
      </div>
      {footer ? (
        <div className="shrink-0 pb-[env(safe-area-inset-bottom,0px)]">{footer}</div>
      ) : null}
    </div>
  );
}
`,
);

write(
  "shared/components/fitness/FitnessBottomNav.tsx",
  `import { Dumbbell, Home, Sparkles, User, Utensils } from "lucide-react";
import type { AppScreen, Lang } from "@fitness-ai/core/types";
import { T } from "../../i18n/translations";
import { GRAD_SOFT } from "../../styles/design";

export type FitnessBottomNavProps = {
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;
  lang: Lang;
};

export function FitnessBottomNav({ screen, setScreen, lang }: FitnessBottomNavProps) {
  const t = T[lang];
  const items: { id: AppScreen; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <Home size={22} />, label: t.home },
    { id: "nutrition", icon: <Utensils size={22} />, label: t.nutrition },
    { id: "workout", icon: <Dumbbell size={22} />, label: t.workout },
    { id: "ai", icon: <Sparkles size={22} />, label: t.ai },
    { id: "profile", icon: <User size={22} />, label: t.profile },
  ];
  return (
    <div
      className="w-full px-4 pb-6 pt-2"
      style={{ background: "linear-gradient(to top, #050A14 60%, transparent)" }}
    >
      <div
        className="flex justify-around items-center px-2 py-3 rounded-3xl"
        style={{
          background: "rgba(10,22,40,0.95)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
        }}
      >
        {items.map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all active:scale-90"
              style={active ? { background: GRAD_SOFT } : {}}
            >
              <div
                style={{
                  color: active ? "#06B6D4" : "rgba(255,255,255,0.35)",
                  filter: active ? "drop-shadow(0 0 8px #06B6D450)" : "none",
                }}
              >
                {item.icon}
              </div>
              <span
                className="text-xs font-semibold"
                style={{
                  color: active ? "#06B6D4" : "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
`,
);

write(
  "shared/components/fitness/SecondaryNavBar.tsx",
  `import { ChevronLeft } from "lucide-react";
import type { AppScreen, Lang } from "@fitness-ai/core/types";
import { T } from "../../i18n/translations";
import { GLASS, GRAD } from "../../styles/design";

const SECONDARY: AppScreen[] = ["progress", "analytics", "health", "premium"];

export type SecondaryNavBarProps = {
  screen: AppScreen;
  lang: Lang;
  onHome: () => void;
  onSelect: (screen: AppScreen) => void;
};

export function SecondaryNavBar({ screen, lang, onHome, onSelect }: SecondaryNavBarProps) {
  const t = T[lang];
  const showTabs = SECONDARY.includes(screen);

  return (
    <div
      className="flex-shrink-0 px-4 pt-2 pb-2.5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onHome}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0"
          style={GLASS}
        >
          <ChevronLeft size={15} className="text-white/70" />
          <span className="text-white/60 text-xs font-semibold">{t.home}</span>
        </button>
        {showTabs ? (
          <div className="flex gap-1.5 overflow-x-auto ml-1">
            {SECONDARY.map((s) => (
              <button
                key={s}
                onClick={() => onSelect(s)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={
                  screen === s
                    ? {
                        background: GRAD,
                        color: "white",
                        boxShadow: "0 2px 12px rgba(0,102,255,0.3)",
                      }
                    : { ...GLASS, color: "rgba(255,255,255,0.4)" }
                }
              >
                {T[lang][s] || s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
`,
);

write(
  "shared/components/index.ts",
  `export { AppShell } from "./layout/AppShell/AppShell";
export type { AppShellProps } from "./layout/AppShell/AppShell";
export { GCard } from "./fitness/GCard";
export { GBtn } from "./fitness/GBtn";
export { ProgressRing } from "./fitness/ProgressRing";
export { MetricPill } from "./fitness/MetricPill";
export { SectionHeader } from "./fitness/SectionHeader";
export { Tag } from "./fitness/Tag";
export { Switch } from "./fitness/Switch";
export { FitnessBottomNav } from "./fitness/FitnessBottomNav";
export type { FitnessBottomNavProps } from "./fitness/FitnessBottomNav";
export { SecondaryNavBar } from "./fitness/SecondaryNavBar";
export type { SecondaryNavBarProps } from "./fitness/SecondaryNavBar";
export { GRAD, GRAD_SOFT, GLASS } from "../styles/design";
export { T } from "../i18n/translations";
`,
);

const screens = [
  {
    folder: "00-welcome",
    file: "WelcomeScreen.tsx",
    start: "// ─── Welcome Screen",
    end: "// ─── Onboarding",
    imports: `import { ArrowRight, Crown, Droplets, Flame, Footprints, Heart, Sparkles, Target } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GRAD } from "@fitness-ai/shared/styles/design";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";`,
    exportName: "WelcomeScreen",
    props: "{ lang, onStart, onLogin }: { lang: Lang; onStart: () => void; onLogin: () => void }",
    wrap: false,
  },
  {
    folder: "01-onboarding",
    file: "OnboardingScreen.tsx",
    start: "// ─── Onboarding",
    end: "// ─── Auth Screen",
    extraBefore: true,
    imports: `import { useState } from "react";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";`,
    exportName: "OnboardingScreen",
    props: "{ lang, onDone }: { lang: Lang; onDone: () => void }",
  },
  {
    folder: "02-auth",
    file: "AuthScreen.tsx",
    start: "// ─── Auth Screen",
    end: "// ─── Dashboard Screen",
    imports: `import { useState } from "react";
import { Apple, Eye, EyeOff, Sparkles } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";`,
    exportName: "AuthScreen",
    props: "{ lang, onDone }: { lang: Lang; onDone: () => void }",
  },
  {
    folder: "05-dashboard",
    file: "DashboardScreen.tsx",
    start: "// ─── Dashboard Screen",
    end: "// ─── Nutrition Screen",
    imports: `import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bell, Droplets, Flame, Footprints, Sparkles } from "lucide-react";
import type { AppScreen, Lang } from "@fitness-ai/core/types";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { MetricPill } from "@fitness-ai/shared/components/fitness/MetricPill";
import { ProgressRing } from "@fitness-ai/shared/components/fitness/ProgressRing";
import { SectionHeader } from "@fitness-ai/shared/components/fitness/SectionHeader";
import { Tag } from "@fitness-ai/shared/components/fitness/Tag";
import { caloriesWeekData } from "@fitness-ai/shared/mock/data";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";
import { Activity, BarChart2, Heart, TrendingUp } from "lucide-react";`,
    exportName: "DashboardScreen",
    props: "{ lang, onNavigateRoot }: { lang: Lang; onNavigateRoot?: (screen: AppScreen) => void }",
    patch: (body) => {
      const quickAccess = `
        {/* Quick Access */}
        <SectionHeader title={lang === "ar" ? "وصول سريع" : lang === "de" ? "Schnellzugriff" : "Quick Access"} />
        <div className="grid grid-cols-2 gap-3 mb-5">
          {([
            { s: "progress" as AppScreen, icon: <TrendingUp size={18} />, label: T[lang].progress, c: "#0066FF" },
            { s: "analytics" as AppScreen, icon: <BarChart2 size={18} />, label: T[lang].analytics, c: "#06B6D4" },
            { s: "health" as AppScreen, icon: <Heart size={18} />, label: T[lang].health, c: "#EF4444" },
            { s: "premium" as AppScreen, icon: <Activity size={18} />, label: T[lang].premium, c: "#8B5CF6" },
          ]).map((item) => (
            <GCard
              key={item.s}
              className="p-4 flex items-center gap-3"
              onClick={() => onNavigateRoot?.(item.s)}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: \`\${item.c}22\`, color: item.c }}>
                {item.icon}
              </div>
              <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>{item.label}</span>
            </GCard>
          ))}
        </div>
`;
      return body.replace(
        "        {/* Weekly calories chart */}",
        quickAccess + "\n        {/* Weekly calories chart */}",
      );
    },
  },
  {
    folder: "06-nutrition",
    file: "NutritionScreen.tsx",
    start: "// ─── Nutrition Screen",
    end: "// ─── Workout Screen",
    extraBefore: true,
    imports: `import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { ChevronDown, ChevronRight, Lightbulb, Plus } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { ProgressRing } from "@fitness-ai/shared/components/fitness/ProgressRing";
import { SectionHeader } from "@fitness-ai/shared/components/fitness/SectionHeader";
import { macros } from "@fitness-ai/shared/mock/data";
import { T } from "@fitness-ai/shared/i18n/translations";`,
    exportName: "NutritionScreen",
    props: "{ lang }: { lang: Lang }",
  },
  {
    folder: "07-workout",
    file: "WorkoutScreen.tsx",
    start: "// ─── Workout Screen",
    end: "// ─── AI Coach Screen",
    extraBefore: true,
    imports: `import { useState } from "react";
import { Check, Clock, Dumbbell, Play, RefreshCw } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { SectionHeader } from "@fitness-ai/shared/components/fitness/SectionHeader";
import { Tag } from "@fitness-ai/shared/components/fitness/Tag";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GLASS } from "@fitness-ai/shared/styles/design";`,
    exportName: "WorkoutScreen",
    props: "{ lang }: { lang: Lang }",
    patch: (body) => body.replace(/\s*const \[seconds, setSeconds\] = useState\(0\);\n/, "\n"),
  },
  {
    folder: "08-ai-coach",
    file: "AICoachScreen.tsx",
    start: "// ─── AI Coach Screen",
    end: "// ─── Progress Screen",
    extraBefore: true,
    imports: `import { useState } from "react";
import { RefreshCw, Send, Sparkles, Zap } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";`,
    exportName: "AICoachScreen",
    props: "{ lang }: { lang: Lang }",
    patch: (body) => body.replace('className="flex flex-col h-screen"', 'className="flex flex-col min-h-0 flex-1"'),
  },
  {
    folder: "09-progress",
    file: "ProgressScreen.tsx",
    start: "// ─── Progress Screen",
    end: "// ─── Analytics Screen",
    imports: `import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Trophy } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { ProgressRing } from "@fitness-ai/shared/components/fitness/ProgressRing";
import { SectionHeader } from "@fitness-ai/shared/components/fitness/SectionHeader";
import { weightData, workoutWeeks } from "@fitness-ai/shared/mock/data";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GRAD } from "@fitness-ai/shared/styles/design";`,
    exportName: "ProgressScreen",
    props: "{ lang }: { lang: Lang }",
  },
  {
    folder: "10-analytics",
    file: "AnalyticsScreen.tsx",
    start: "// ─── Analytics Screen",
    end: "// ─── Health Screen",
    imports: `import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Lightbulb, TrendingUp } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { SectionHeader } from "@fitness-ai/shared/components/fitness/SectionHeader";
import { caloriesWeekData, macros, sleepData, workoutWeeks } from "@fitness-ai/shared/mock/data";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";`,
    exportName: "AnalyticsScreen",
    props: "{ lang }: { lang: Lang }",
  },
  {
    folder: "11-health",
    file: "HealthScreen.tsx",
    start: "// ─── Health Screen",
    end: "// ─── Premium Screen",
    imports: `import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Droplets, Heart, Moon, Wind, Zap } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { ProgressRing } from "@fitness-ai/shared/components/fitness/ProgressRing";
import { SectionHeader } from "@fitness-ai/shared/components/fitness/SectionHeader";
import { Tag } from "@fitness-ai/shared/components/fitness/Tag";
import { sleepData } from "@fitness-ai/shared/mock/data";
import { T } from "@fitness-ai/shared/i18n/translations";`,
    exportName: "HealthScreen",
    props: "{ lang }: { lang: Lang }",
  },
  {
    folder: "12-premium",
    file: "PremiumScreen.tsx",
    start: "// ─── Premium Screen",
    end: "// ─── Profile Screen",
    extraBefore: true,
    imports: `import { useState } from "react";
import { Activity, BarChart2, Bluetooth, Check, Crown, Download, Leaf, Shield, Sparkles, Target } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { SectionHeader } from "@fitness-ai/shared/components/fitness/SectionHeader";
import { GLASS, GRAD, GRAD_SOFT } from "@fitness-ai/shared/styles/design";`,
    exportName: "PremiumScreen",
    props: "{ lang }: { lang: Lang }",
  },
  {
    folder: "13-profile",
    file: "ProfileScreen.tsx",
    start: "// ─── Profile Screen",
    end: "// ─── Bottom Navigation",
    extraBefore: true,
    imports: `import { useState } from "react";
import {
  Activity, Bell, Bluetooth, Check, ChevronRight, Crown, Download, Edit, Globe, LogOut, Shield, Target,
} from "lucide-react";
import type { AppScreen, Lang } from "@fitness-ai/core/types";
import { APP_VERSION } from "@fitness-ai/core/constants";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { Switch } from "@fitness-ai/shared/components/fitness/Switch";
import { Tag } from "@fitness-ai/shared/components/fitness/Tag";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GRAD } from "@fitness-ai/shared/styles/design";`,
    exportName: "ProfileScreen",
    props: "{ lang, setLang, onNavigateRoot }: { lang: Lang; setLang: (l: Lang) => void; onNavigateRoot?: (screen: AppScreen) => void }",
    patch: (body) => {
      body = body.replace(/Fitness AI v2\.4\.1/g, `Fitness AI v\${APP_VERSION}`);
      body = body.replace(
        'onClick={item.action === "lang" ? () => setLang(item.langVal) : undefined}',
        'onClick={item.action === "lang" ? () => setLang(item.langVal) : item.l === (lang === "ar" ? "الأهداف" : lang === "de" ? "Ziele" : "Goals") ? () => onNavigateRoot?.("progress") : item.l.includes("Premium") || item.icon?.type?.name === "Crown" ? () => onNavigateRoot?.("premium") : undefined}',
      );
      body = body.replace(/\(item: any, ii: number\)/, "(item: SettingsItem, ii: number)");
      return `type SettingsItem = {
  icon: React.ReactNode;
  l: string;
  action: string;
  val?: boolean;
  onChange?: () => void;
  langVal?: Lang;
  danger?: boolean;
};

${body}`;
    },
  },
];

for (const screen of screens) {
  let block = extractBetween(screen.start, screen.end);
  block = block.replace(/^\/\/ ───[^\n]+\n/, "");
  if (screen.extraBefore) {
    const fnIdx = block.indexOf("function ");
    block = block.slice(0, fnIdx).trimEnd() + "\n\n" + block.slice(fnIdx);
  }
  const fnBodyRaw = extractFunction(screen.exportName, block);
  if (!fnBodyRaw) throw new Error(`Screen function not found: ${screen.folder}`);
  let fnBody = fnBodyRaw;
  fnBody = fnBody.replace(/^function \w+\([^)]*\)/, `export function ${screen.exportName}(${screen.props})`);
  if (screen.patch) fnBody = screen.patch(fnBody);
  write(`apps/fitness-ai/src/screens/${screen.folder}/${screen.file}`, `${screen.imports}\n\n${block.startsWith("const") || block.startsWith("type") ? block.slice(0, block.indexOf("function ")).trim() + "\n\n" : ""}${fnBody}\n`);
}

write(
  "apps/fitness-ai/src/screens/index.ts",
  `export { WelcomeScreen } from "./00-welcome/WelcomeScreen";
export { OnboardingScreen } from "./01-onboarding/OnboardingScreen";
export { AuthScreen } from "./02-auth/AuthScreen";
export { DashboardScreen } from "./05-dashboard/DashboardScreen";
export { NutritionScreen } from "./06-nutrition/NutritionScreen";
export { WorkoutScreen } from "./07-workout/WorkoutScreen";
export { AICoachScreen } from "./08-ai-coach/AICoachScreen";
export { ProgressScreen } from "./09-progress/ProgressScreen";
export { AnalyticsScreen } from "./10-analytics/AnalyticsScreen";
export { HealthScreen } from "./11-health/HealthScreen";
export { PremiumScreen } from "./12-premium/PremiumScreen";
export { ProfileScreen } from "./13-profile/ProfileScreen";
`,
);

console.log("Scaffold complete.");
