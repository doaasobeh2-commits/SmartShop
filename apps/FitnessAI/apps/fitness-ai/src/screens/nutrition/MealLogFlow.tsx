import { useMemo, useState } from "react";

import { Check, ChevronLeft, Search } from "lucide-react";

import { searchFoods } from "../../fitnessBrain/foodKnowledge";

import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";

import { GCard } from "@fitness-ai/shared/components/fitness/GCard";

import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";



type MealLogFlowProps = {

  lang: "de" | "en" | "ar";

  onClose: () => void;

  onSave: (input: { name: string; foodId: string; servingGrams: number }) => boolean;

};



const SERVING_PRESETS = [50, 100, 150, 200];



export function MealLogFlow({ lang, onClose, onSave }: MealLogFlowProps) {

  const [query, setQuery] = useState("");

  const [foodId, setFoodId] = useState<string | null>(null);

  const [foodName, setFoodName] = useState("");

  const [servingGrams, setServingGrams] = useState<number | null>(null);

  const [customGrams, setCustomGrams] = useState("");

  const [saving, setSaving] = useState(false);



  const results = useMemo(

    () => searchFoods({ query, limit: 20 }).map((r) => r.item),

    [query],

  );



  const pickFood = (id: string, name: string) => {

    setFoodId(id);

    setFoodName(name);

    setServingGrams(100);

  };



  const resolvedGrams = servingGrams ?? (customGrams ? parseInt(customGrams, 10) : null);



  const handleSave = () => {

    if (!foodId || !resolvedGrams || resolvedGrams <= 0) return;

    setSaving(true);

    const ok = onSave({ name: foodName, foodId, servingGrams: resolvedGrams });

    setSaving(false);

    if (ok) onClose();

  };



  const title =

    lang === "de" ? "Mahlzeit loggen" : lang === "ar" ? "تسجيل وجبة" : "Log a meal";

  const searchPh =

    lang === "de" ? "Lebensmittel suchen…" : lang === "ar" ? "ابحث عن طعام…" : "Search foods…";

  const saveLabel = lang === "de" ? "Speichern" : lang === "ar" ? "حفظ" : "Save";



  return (

    <div className="fixed inset-0 z-50 flex min-h-[var(--app-height)] flex-col bg-[#050A14]">

      <div className="flex-shrink-0 px-6 pt-4 pb-5">

        <div className="mb-5 flex items-center gap-4">

          <button

            type="button"

            onClick={onClose}

            className="flex h-10 w-10 items-center justify-center rounded-2xl"

            style={GLASS}

            aria-label="Back"

          >

            <ChevronLeft size={20} className="text-white" />

          </button>

          <h2 className="text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

            {title}

          </h2>

        </div>

        <div

          className="flex items-center gap-3 rounded-2xl px-4 py-3"

          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}

        >

          <Search size={18} className="text-white/40" />

          <input

            value={query}

            onChange={(e) => setQuery(e.target.value)}

            placeholder={searchPh}

            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"

          />

        </div>

      </div>



      <div className="flex-1 overflow-y-auto px-6 pb-6">

        {!foodId ? (

          <div className="flex flex-col gap-2">

            {(query ? results : searchFoods({ query: "", limit: 12 }).map((r) => r.item)).map((item) => (

              <button

                key={item.id}

                type="button"

                onClick={() => pickFood(item.id, item.name)}

                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white transition-all active:scale-[0.98]"

                style={GLASS}

              >

                {item.name}

              </button>

            ))}

          </div>

        ) : (

          <div className="flex flex-col gap-4">

            <GCard className="p-4" style={GLASS}>

              <p className="font-bold text-white">{foodName}</p>

              <p className="mt-1 text-xs text-white/40">

                {lang === "de" ? "Portionsgröße (g)" : "Serving size (g)"}

              </p>

              <div className="mt-3 grid grid-cols-4 gap-2">

                {SERVING_PRESETS.map((g) => (

                  <button

                    key={g}

                    type="button"

                    onClick={() => {

                      setServingGrams(g);

                      setCustomGrams("");

                    }}

                    className="rounded-xl py-2 text-xs font-bold text-white"

                    style={servingGrams === g ? { background: GRAD } : GLASS}

                  >

                    {g}g

                  </button>

                ))}

              </div>

              <input

                type="number"

                min={1}

                value={customGrams}

                onChange={(e) => {

                  setCustomGrams(e.target.value);

                  setServingGrams(null);

                }}

                placeholder="Custom g"

                className="mt-3 w-full rounded-xl px-3 py-2 text-sm text-white outline-none"

                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}

              />

            </GCard>

            <GBtn className="w-full" onClick={resolvedGrams && !saving ? handleSave : undefined}>

              {saving ? "…" : saveLabel}

              {!saving ? <Check size={18} /> : null}

            </GBtn>

          </div>

        )}

      </div>

    </div>

  );

}


