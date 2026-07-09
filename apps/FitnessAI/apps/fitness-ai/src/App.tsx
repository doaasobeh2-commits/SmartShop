import { useCallback, useEffect, useRef, useState } from "react";
import type { FlowScreen, Lang, MainTab } from "@fitness-ai/core/types";
import { ensureLocalInstallationId } from "./fitnessBrain/privacy";
import { AppShell, FitnessBottomNav, T } from "@fitness-ai/shared/components";
import type { ReturnNavigation } from "./navigation/returnNavigation";
import {
  AuthScreen,
  CoachScreen,
  NutritionScreen,
  OnboardingScreen,
  PremiumScreen,
  ProfileScreen,
  TodayScreen,
  WelcomeScreen,
  WorkoutScreen,
} from "./screens";

type AppPhase = "flow" | "main" | "premium";

export function App() {
  const [phase, setPhase] = useState<AppPhase>("flow");
  const [flowStack, setFlowStack] = useState<FlowScreen[]>(["welcome"]);
  const [mainTab, setMainTab] = useState<MainTab>("today");
  const [returnNav, setReturnNav] = useState<ReturnNavigation | null>(null);
  const [lang, setLang] = useState<Lang>("de");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureLocalInstallationId();
  }, []);

  const currentFlow = flowStack[flowStack.length - 1];
  const dir = T[lang].dir;

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onNavigateFlow = useCallback((screen: FlowScreen) => {
    setFlowStack((stack) => [...stack, screen]);
  }, []);

  const flowBack = useCallback(() => {
    setFlowStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const enterMainApp = useCallback(() => {
    setPhase("main");
    setMainTab("today");
    setReturnNav(null);
  }, []);

  const handleTabChange = useCallback(
    (tab: MainTab) => {
      setReturnNav(null);
      setMainTab(tab);
      scrollToTop();
    },
    [scrollToTop],
  );

  const navigateFromToday = useCallback(
    (tab: MainTab) => {
      setReturnNav({
        fromTab: "today",
        onReturn: () => {
          setMainTab("today");
          setReturnNav(null);
          scrollToTop();
        },
      });
      setMainTab(tab);
      scrollToTop();
    },
    [scrollToTop],
  );

  const returnToToday = returnNav?.fromTab === "today" ? returnNav.onReturn : undefined;

  const openPremium = useCallback(() => setPhase("premium"), []);
  const closePremium = useCallback(() => setPhase("main"), []);

  if (phase === "flow") {
    return (
      <div className="app-screen-host min-h-[var(--app-height)] w-full" style={{ background: "var(--gradient-app-background)" }}>
        <AppShell className="bg-[#050A14]">
          <div className="screen-scroll" dir={dir}>
            {currentFlow === "welcome" ? (
              <WelcomeScreen
                lang={lang}
                onStart={() => onNavigateFlow("onboarding")}
                onLogin={() => setFlowStack(["welcome", "auth"])}
              />
            ) : currentFlow === "onboarding" ? (
              <OnboardingScreen lang={lang} onDone={() => onNavigateFlow("auth")} onBack={flowBack} />
            ) : (
              <AuthScreen lang={lang} onDone={enterMainApp} onBack={flowBack} />
            )}
          </div>
        </AppShell>
      </div>
    );
  }

  if (phase === "premium") {
    return (
      <div className="app-screen-host min-h-[var(--app-height)] w-full" style={{ background: "var(--gradient-app-background)" }}>
        <AppShell className="bg-[#050A14]">
          <div className="screen-scroll" dir={dir}>
            <PremiumScreen lang={lang} onClose={closePremium} />
          </div>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="app-screen-host min-h-[var(--app-height)] w-full" style={{ background: "var(--gradient-app-background)" }}>
      <AppShell
        className="bg-[#050A14]"
        footer={<FitnessBottomNav tab={mainTab} onTabChange={handleTabChange} lang={lang} />}
      >
        <div ref={scrollRef} className="screen-scroll min-h-0 flex-1" dir={dir}>
          {mainTab === "today" ? <TodayScreen lang={lang} onGoTo={navigateFromToday} /> : null}
          {mainTab === "nutrition" ? <NutritionScreen lang={lang} onReturn={returnToToday} /> : null}
          {mainTab === "workout" ? <WorkoutScreen lang={lang} onReturn={returnToToday} /> : null}
          {mainTab === "coach" ? <CoachScreen lang={lang} onReturn={returnToToday} /> : null}
          {mainTab === "profile" ? (
            <ProfileScreen lang={lang} setLang={setLang} onOpenPremium={openPremium} />
          ) : null}
        </div>
      </AppShell>
    </div>
  );
}
