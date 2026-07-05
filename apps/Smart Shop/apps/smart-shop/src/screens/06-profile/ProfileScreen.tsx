import { useState, useEffect } from "react";
import {
  AppShell,
  Button,
  Header,
} from "@smart-shop/shared";
import {
  PET_TYPE_OPTIONS,
  finalizeHouseholdSetup,
  type HouseholdPet,
  type HouseholdSetupSnapshot,
  type PetType,
  type ShoppingFrequency,
} from "@smart-shop/core";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { MainBottomNav } from "../../navigation/MainBottomNav";
import { useAppState } from "../../state/AppProvider";
import { isAdminEmail, normalizeEmail } from "../../auth/adminAccess";
import {
  chipClass,
  FAMILY_SIZE_OPTIONS,
  RESTAURANT_OPTIONS,
  SHOPPING_FREQUENCY_OPTIONS,
  SHOPPING_PREFERENCE_OPTIONS,
  sizeButtonClass,
  SUPERMARKET_OPTIONS,
} from "../../constants/householdOptions";

function PawPrintIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={15}
      height={15}
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}

export function ProfileScreen({ onBack, onNavigate, onNavigateRoot }: ScreenNavigationProps = {}) {
  const { session, householdSetup, updateHouseholdSetup, updateSessionUser, logout } = useAppState();
  const showAdmin = isAdminEmail(session.user?.email);

  const [firstName, setFirstName] = useState(session.user?.firstName ?? "");
  const [lastName, setLastName] = useState(session.user?.lastName ?? "");
  const [email, setEmail] = useState(session.user?.email ?? "");
  const [familySize, setFamilySize] = useState(householdSetup.familySize);
  const [childrenCount, setChildrenCount] = useState(householdSetup.childrenCount);
  const [hasPets, setHasPets] = useState(householdSetup.hasPets);
  const [pets, setPets] = useState<HouseholdPet[]>(householdSetup.pets);
  const [city, setCity] = useState(householdSetup.city);
  const [supermarkets, setSupermarkets] = useState<string[]>(householdSetup.favouriteSupermarkets);
  const [restaurants, setRestaurants] = useState<string[]>(householdSetup.favouriteRestaurants);
  const [budget, setBudget] = useState(householdSetup.monthlyBudget?.toString() ?? "");
  const [shoppingFrequency, setShoppingFrequency] = useState<ShoppingFrequency>(
    householdSetup.shoppingFrequency,
  );
  const [shoppingPreferences, setShoppingPreferences] = useState<string[]>(
    householdSetup.shoppingPreferences,
  );
  const [petSelectionHint, setPetSelectionHint] = useState(false);
  const [savedHint, setSavedHint] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!session.user) {
      return;
    }
    setFirstName(session.user.firstName);
    setLastName(session.user.lastName);
    setEmail(session.user.email);
  }, [session.user]);

  const toggleListItem = (list: string[], value: string, setter: (next: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
      return;
    }
    setter([...list, value]);
  };

  const togglePetType = (type: PetType) => {
    setPetSelectionHint(false);
    if (pets.some((pet) => pet.type === type)) {
      setPets(pets.filter((pet) => pet.type !== type));
      return;
    }
    setPets([...pets, { type, quantity: 1 }]);
  };

  const setPetQuantity = (type: PetType, quantity: number) => {
    const nextQuantity = Math.max(1, Math.min(9, quantity));
    setPets(
      pets.map((pet) => (pet.type === type ? { ...pet, quantity: nextQuantity } : pet)),
    );
  };

  const toggleHasPets = () => {
    setHasPets((current) => {
      const next = !current;
      if (!next) {
        setPets([]);
        setPetSelectionHint(false);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (hasPets && pets.length === 0) {
      setPetSelectionHint(true);
      return;
    }

    if (session.user) {
      updateSessionUser({
        firstName: firstName.trim() || session.user.firstName,
        lastName: lastName.trim() || session.user.lastName,
        email: normalizeEmail(email) || session.user.email,
      });
    }

    const setup: HouseholdSetupSnapshot = finalizeHouseholdSetup({
      familySize,
      childrenCount,
      hasPets,
      pets,
      city: city.trim() || "St. Pölten",
      favouriteSupermarkets: supermarkets.length > 0 ? supermarkets : ["Billa"],
      favouriteRestaurants: restaurants,
      monthlyBudget: budget ? Number(budget) : undefined,
      shoppingFrequency,
      shoppingPreferences,
    });

    updateHouseholdSetup(setup);
    setSavedHint(true);
    window.setTimeout(() => setSavedHint(false), 2000);
  };

  return (
    <AppShell footer={<MainBottomNav activeId="profile" onNavigate={onNavigate} />}>
      <div className="screen-scroll">
        <Header title="Profil" subtitle="Haushalt bearbeiten" onBack={onBack} />

        <div className="flex-1 space-y-3 px-5 pt-4">
          <SectionCard title="Konto">
            <div className="space-y-3">
              <div>
                <FieldLabel>Vorname</FieldLabel>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/20 px-3.5 py-3 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div>
                <FieldLabel>Nachname</FieldLabel>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/20 px-3.5 py-3 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div>
                <FieldLabel>E-Mail</FieldLabel>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/20 px-3.5 py-3 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>
          </SectionCard>

          {showAdmin ? (
            <button
              type="button"
              onClick={() => onNavigate?.("13-admin")}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Admin</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pilot-Daten und Verwaltung
                </p>
              </div>
              <span className="text-xs font-bold text-primary">Öffnen</span>
            </button>
          ) : null}

          <SectionCard title="Haushalt">
            <div className="space-y-4">
              <div>
                <FieldLabel>Familiengröße</FieldLabel>
                <div className="flex gap-1.5">
                  {FAMILY_SIZE_OPTIONS.slice(0, 6).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFamilySize(size)}
                      className={sizeButtonClass(familySize === size)}
                    >
                      {size}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFamilySize(7)}
                    className={sizeButtonClass(familySize === 7)}
                  >
                    7+
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel>Kinder</FieldLabel>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setChildrenCount(count)}
                      className={sizeButtonClass(childrenCount === count)}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Haustiere">
            <button
              type="button"
              onClick={toggleHasPets}
              className="mb-3 flex w-full items-center justify-between rounded-xl border border-border bg-secondary/20 p-3"
            >
              <div className="flex items-center gap-3">
                <PawPrintIcon className={hasPets ? "text-accent" : "text-muted-foreground"} />
                <span className="text-sm font-semibold text-foreground">Haustiere im Haushalt</span>
              </div>
              <span className="text-xs font-bold text-primary">{hasPets ? "Ja" : "Nein"}</span>
            </button>
            {hasPets ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {PET_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => togglePetType(option.type)}
                      className={chipClass(pets.some((pet) => pet.type === option.type))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {pets.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {pets.map((pet) => {
                      const label =
                        PET_TYPE_OPTIONS.find((option) => option.type === pet.type)?.label ??
                        pet.type;
                      return (
                        <div
                          key={pet.type}
                          className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 px-3 py-2.5"
                        >
                          <span className="text-sm font-semibold text-foreground">{label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPetQuantity(pet.type, pet.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold"
                            >
                              −
                            </button>
                            <span className="min-w-[1.25rem] text-center text-sm font-bold">
                              {pet.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPetQuantity(pet.type, pet.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {petSelectionHint ? (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    Bitte wähle mindestens eine Tierart.
                  </p>
                ) : null}
              </>
            ) : null}
          </SectionCard>

          <SectionCard title="Stadt">
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="St. Pölten"
              className="w-full rounded-xl border border-border bg-secondary/20 px-3.5 py-3 text-sm text-foreground focus:outline-none"
            />
          </SectionCard>

          <SectionCard title="Supermärkte">
            <div className="flex flex-wrap gap-2">
              {SUPERMARKET_OPTIONS.map((store) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => toggleListItem(supermarkets, store, setSupermarkets)}
                  className={chipClass(supermarkets.includes(store))}
                >
                  {store}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Restaurants">
            <div className="flex flex-wrap gap-2">
              {RESTAURANT_OPTIONS.map((restaurant) => (
                <button
                  key={restaurant}
                  type="button"
                  onClick={() => toggleListItem(restaurants, restaurant, setRestaurants)}
                  className={chipClass(restaurants.includes(restaurant))}
                >
                  {restaurant}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Budget">
            <FieldLabel>Monatsbudget (€)</FieldLabel>
            <input
              type="number"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="380"
              className="w-full rounded-xl border border-border bg-secondary/20 px-3.5 py-3 text-sm text-foreground focus:outline-none"
            />
          </SectionCard>

          <SectionCard title="Einkaufshäufigkeit">
            <div className="flex flex-wrap gap-2">
              {SHOPPING_FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setShoppingFrequency(option.value)}
                  className={chipClass(shoppingFrequency === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Einkaufspräferenzen">
            <div className="flex flex-wrap gap-2">
              {SHOPPING_PREFERENCE_OPTIONS.map((preference) => (
                <button
                  key={preference}
                  type="button"
                  onClick={() =>
                    toggleListItem(shoppingPreferences, preference, setShoppingPreferences)
                  }
                  className={chipClass(shoppingPreferences.includes(preference))}
                >
                  {preference}
                </button>
              ))}
            </div>
          </SectionCard>

          <button
            type="button"
            onClick={() => onNavigate?.("17-inventory-offers")}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">Vorräte & Angebote</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Basis-Vorräte pflegen und lokale Angebote erfassen
              </p>
            </div>
            <span className="text-xs font-bold text-primary">Öffnen</span>
          </button>
        </div>

        <div className="space-y-2 px-5 pb-5 pt-3">
          {savedHint ? (
            <p className="text-center text-xs font-semibold text-primary">Gespeichert</p>
          ) : null}
          <Button onClick={handleSave}>Änderungen speichern</Button>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 text-sm font-bold text-muted-foreground"
          >
            Abmelden
          </button>
        </div>
      </div>

      {showLogoutConfirm ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <h2
              id="logout-dialog-title"
              className="text-lg font-black text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Abmelden
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Möchtest du dich wirklich abmelden?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  onNavigateRoot?.("03-login");
                }}
              >
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
