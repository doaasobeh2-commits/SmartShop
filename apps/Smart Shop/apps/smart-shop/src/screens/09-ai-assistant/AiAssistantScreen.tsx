import {
  AppShell,
  Header,
  PreviewShell,
  SparklesIcon,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import type { AssistantMessage } from "./types";

type IconProps = {
  size?: number;
  className?: string;
};

function ArrowRightIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const MESSAGES: AssistantMessage[] = [
  { role: "user", text: "Ich brauche gesunde Snacks für die Woche" },
  {
    role: "ai",
    text: "Basierend auf Ihren Präferenzen empfehle ich: Nüsse, Trockenfrüchte, Hummus mit Gemüsesticks.",
  },
  { role: "user", text: "Ja, bitte zur Liste hinzufügen" },
  { role: "ai", text: "✓ 4 Produkte hinzugefügt. Geschätzter Preis: €18.50" },
];

function messageRowClass(role: AssistantMessage["role"]) {
  return role === "user" ? "flex justify-end" : "flex justify-start";
}

function messageBubbleClass(role: AssistantMessage["role"]) {
  return role === "user"
    ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-white"
    : "max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-foreground";
}

export function AiAssistantScreen({ onBack }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={10}>
      <AppShell>
        <div className="flex h-full flex-col">
          <StatusBar />
          <Header
            title="KI-Assistent"
            onBack={onBack}
            rightSlot={<SparklesIcon size={14} />}
          />

          <div className="flex-1 space-y-3 overflow-y-auto px-5 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MESSAGES.map((message, index) => (
              <div key={index} className={messageRowClass(message.role)}>
                <div className={messageBubbleClass(message.role)}>
                  {message.role === "ai" ? (
                    <div className="mb-1 flex items-center gap-1.5">
                      <SparklesIcon size={9} className="text-accent" />
                      <span className="text-[9px] font-bold uppercase text-accent">KI</span>
                    </div>
                  ) : null}
                  <p className="text-xs leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5 pt-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2.5">
              <input
                type="text"
                placeholder="Nachricht schreiben..."
                className="flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary-30"
                aria-label="Nachricht senden"
              >
                <ArrowRightIcon className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
