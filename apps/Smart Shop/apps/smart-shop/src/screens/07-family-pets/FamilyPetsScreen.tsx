import {
  AppShell,
  Button,
  Header,
  PreviewShell,
  SparklesIcon,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import type { FamilyMember, Pet } from "./types";

type IconProps = {
  size?: number;
  className?: string;
};

function PawPrintIcon({ size = 18, className = "" }: IconProps) {
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
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  );
}

function EditIcon({ size = 14, className = "" }: IconProps) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

const FAMILY_MEMBERS: FamilyMember[] = [
  { name: "Maria", role: "Erwachsener", age: "35 Jahre" },
  { name: "Thomas", role: "Erwachsener", age: "38 Jahre" },
  { name: "Sophie", role: "Kind", age: "8 Jahre" },
];

const PETS: Pet[] = [
  { name: "Luna", type: "Hund", breed: "Labrador", age: "3 Jahre" },
];

export function FamilyPetsScreen({ onBack }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={8}>
      <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header
            title="Familie & Haustiere"
            onBack={onBack}
            rightSlot={<SparklesIcon size={14} />}
          />

          <div className="flex-1 space-y-4 px-5 pt-4">
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground">Familienmitglieder</h3>
                <button type="button" className="text-xs font-bold text-primary">
                  + Hinzufügen
                </button>
              </div>
              <div className="space-y-2">
                {FAMILY_MEMBERS.map((member) => (
                  <div
                    key={member.name}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.role} · {member.age}
                        </p>
                      </div>
                      <EditIcon className="text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground">Haustiere</h3>
                <button type="button" className="text-xs font-bold text-primary">
                  + Hinzufügen
                </button>
              </div>
              <div className="space-y-2">
                {PETS.map((pet) => (
                  <div
                    key={pet.name}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
                        <PawPrintIcon className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{pet.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pet.breed} · {pet.age}
                        </p>
                      </div>
                      <EditIcon className="text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 pt-3">
            <Button>Speichern</Button>
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
