import { AppShell, Header, StatusBar } from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";

const ADMIN_SECTIONS = [
  "Benutzer",
  "Familien",
  "Geschäfte",
  "Angebote",
  "Inventar",
  "Timeline",
  "Lernen",
  "KI",
  "Berichte",
  "Abonnements",
  "Einstellungen",
] as const;

type AdminCardProps = {
  title: string;
};

function AdminCard({ title }: AdminCardProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
    >
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">Öffnen</span>
    </button>
  );
}

export function AdminScreen({ onBack }: ScreenNavigationProps = {}) {
  return (
    <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header
            title="Admin"
            subtitle="fadisobehau@gmail.com"
            onBack={onBack}
          />

          <div className="flex-1 space-y-2 px-5 pt-4 pb-5">
            {ADMIN_SECTIONS.map((section) => (
              <AdminCard key={section} title={section} />
            ))}
          </div>
        </div>
      </AppShell>
  );
}
