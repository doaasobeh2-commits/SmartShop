import { useState } from "react";
import {
  AppShell,
  Button,
  SparklesIcon,
} from "@smart-shop/shared";
import {
  PET_TYPE_OPTIONS,
  finalizeHouseholdSetup,
  type HouseholdPet,
  type PetType,
} from "@smart-shop/core";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";
import {
  chipClass,
  FAMILY_SIZE_OPTIONS,
  RESTAURANT_OPTIONS,
  sizeButtonClass,
  SUPERMARKET_OPTIONS,
} from "../../constants/householdOptions";

const SETUP_NOTE =
  "Diese Einrichtung wird nur einmal angezeigt. Du kannst alles später im Profil bearbeiten.";

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

export function HouseholdWizardScreen({ onNavigate }: ScreenNavigationProps = {}) {
  const { completeHouseholdSetup, householdSetup } = useAppState();
  const [step, setStep] = useState(1);
  const [familySize, setFamilySize] = useState(householdSetup.familySize);
  const [childrenCount, setChildrenCount] = useState(householdSetup.childrenCount);
  const [hasPets, setHasPets] = useState(householdSetup.hasPets);
  const [pets, setPets] = useState<HouseholdPet[]>(householdSetup.pets);
  const [petSelectionHint, setPetSelectionHint] = useState(false);
  const [city, setCity] = useState(householdSetup.city);
  const [supermarkets, setSupermarkets] = useState<string[]>(
    householdSetup.favouriteSupermarkets.length > 0
      ? householdSetup.favouriteSupermarkets
      : ["Billa"],
  );
  const [restaurants, setRestaurants] = useState<string[]>(
    householdSetup.favouriteRestaurants,
  );
  const [budget, setBudget] = useState(
    householdSetup.monthlyBudget?.toString() ?? "",
  );

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

  const finishSetup = () => {
    completeHouseholdSetup(
      finalizeHouseholdSetup({
        familySize,
        childrenCount,
        hasPets,
        pets,
        city: city.trim() || "St. Pölten",
        favouriteSupermarkets: supermarkets.length > 0 ? supermarkets : ["Billa"],
        favouriteRestaurants: restaurants,
        monthlyBudget: budget ? Number(budget) : undefined,
        shoppingFrequency: "weekly",
        shoppingPreferences: [],
      }),
    );
    onNavigate?.("05-dashboard");
  };

  const nextStep = () => {
    if (step === 1 && hasPets && pets.length === 0) {
      setPetSelectionHint(true);
      return;
    }
    if (step >= 5) {
      finishSetup();
      return;
    }
    setStep((current) => current + 1);
  };

  const skipOptional = () => {
    if (step === 4 || step === 5) {
      if (step === 5) {
        finishSetup();
        return;
      }
      setStep(5);
      return;
    }
    nextStep();
  };

  return (
    <AppShell>
      <div className="screen-scroll">
        <div className="px-5 pb-3 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/40 bg-primary/25">
              <SparklesIcon size={13} className="text-primary" />
            </div>
            <span className="text-[10px] font-black tracking-[0.15em] text-muted-foreground">
              EINRICHTUNG · {step}/5
            </span>
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{SETUP_NOTE}</p>
          <h2
            className="text-xl font-black text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {step === 1 && "Haushalt"}
            {step === 2 && "Standort"}
            {step === 3 && "Lieblingssupermärkte"}
            {step === 4 && "Lieblingsrestaurants"}
            {step === 5 && "Budget"}
          </h2>
        </div>

        <div className="flex-1 space-y-4 px-5">
          {step === 1 ? (
            <>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Familiengröße
                </label>
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
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Kinder
                </label>
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

              <button
                type="button"
                onClick={toggleHasPets}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={
                      hasPets
                        ? "flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/15"
                        : "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/40"
                    }
                  >
                    <PawPrintIcon className={hasPets ? "text-accent" : "text-muted-foreground"} />
                  </div>
                  <p className="text-left text-sm font-semibold text-foreground">Haustiere</p>
                </div>
                <div className={hasPets ? "h-6 w-11 rounded-full bg-primary" : "h-6 w-11 rounded-full bg-muted"}>
                  <span
                    className={
                      hasPets
                        ? "mt-0.5 block h-5 w-5 translate-x-[22px] rounded-full bg-white shadow-sm"
                        : "mt-0.5 block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm"
                    }
                  />
                </div>
              </button>

              {hasPets ? (
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Tierart
                  </label>
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
                    <div className="space-y-2 pt-1">
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
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold text-foreground"
                                aria-label={`${label} verringern`}
                              >
                                −
                              </button>
                              <span className="min-w-[1.25rem] text-center text-sm font-bold text-foreground">
                                {pet.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPetQuantity(pet.type, pet.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold text-foreground"
                                aria-label={`${label} erhöhen`}
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
                    <p className="text-xs font-semibold text-amber-600">
                      Bitte wähle mindestens eine Tierart.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Stadt
              </label>
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="St. Pölten"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
          ) : null}

          {step === 3 ? (
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
          ) : null}

          {step === 4 ? (
            <>
              <p className="text-xs text-muted-foreground">Optional</p>
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
            </>
          ) : null}

          {step === 5 ? (
            <>
              <p className="text-xs text-muted-foreground">Optional · Monatsbudget in €</p>
              <input
                type="number"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="380"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </>
          ) : null}
        </div>

        <div className="space-y-2 px-5 pb-5 pt-3">
          <Button onClick={nextStep}>
            {step === 5 ? "Smart Shopping starten" : "Weiter"}
          </Button>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className="w-full py-3 text-sm font-bold text-muted-foreground"
            >
              Zurück
            </button>
          ) : null}
          {step === 4 || step === 5 ? (
            <button
              type="button"
              onClick={skipOptional}
              className="w-full py-3 text-sm font-bold text-muted-foreground"
            >
              Überspringen
            </button>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
