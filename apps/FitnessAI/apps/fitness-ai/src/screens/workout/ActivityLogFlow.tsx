import { useMemo, useState } from "react";
import { Check, ChevronLeft, Search } from "lucide-react";
import type { ActivityIntensity } from "../../fitnessBrain/activity";
import {
  ACTIVITY_LOG_STRINGS,
  groupActivitiesByCategory,
  searchCatalogActivities,
  UI_ACTIVITY_CATEGORIES,
} from "../../fitnessBrain/activity";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";

const TOTAL_STEPS = 4;
const S = ACTIVITY_LOG_STRINGS;

type ActivityLogFlowProps = {
  onClose: () => void;
  onSave: (input: {
    activityId: string;
    durationMinutes: number;
    intensity: ActivityIntensity;
    optionalNote?: string;
  }) => boolean;
};

export function ActivityLogFlow({ onClose, onSave }: ActivityLogFlowProps) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [activityId, setActivityId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [intensity, setIntensity] = useState<ActivityIntensity | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => searchCatalogActivities(query), [query]);
  const grouped = useMemo(() => groupActivitiesByCategory(filtered), [filtered]);
  const selectedActivity = activityId
    ? filtered.find((a) => a.id === activityId) ?? searchCatalogActivities("").find((a) => a.id === activityId)
    : null;

  const resolvedDuration = showCustom ? parseInt(customDuration, 10) : duration;

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else onClose();
  };

  const pickActivity = (id: string) => {
    setActivityId(id);
    setStep(1);
  };

  const pickDuration = (mins: number) => {
    setShowCustom(false);
    setDuration(mins);
    setStep(2);
  };

  const pickCustomDuration = () => {
    setShowCustom(true);
    setDuration(null);
  };

  const confirmCustomDuration = () => {
    const mins = parseInt(customDuration, 10);
    if (mins >= 5 && mins <= 300) setStep(2);
  };

  const pickIntensity = (level: ActivityIntensity) => {
    setIntensity(level);
    setStep(3);
  };

  const handleDone = () => {
    if (!activityId || !resolvedDuration || !intensity) return;
    setSaving(true);
    const ok = onSave({
      activityId,
      durationMinutes: resolvedDuration,
      intensity,
      optionalNote: note.trim() || undefined,
    });
    setSaving(false);
    if (ok) onClose();
  };

  const stepTitles = [
    S.logActivity,
    S.stepDuration,
    S.stepIntensity,
    S.stepNote,
  ];

  return (
    <div className="fixed inset-0 z-50 flex min-h-[var(--app-height)] flex-col bg-[#050A14]">
      <div className="flex-shrink-0 px-6 pt-4 pb-5">
        <div className="mb-5 flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label={S.back}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-opacity active:scale-95"
            style={GLASS}
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <div className="mb-2 flex gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-all duration-500"
                  style={{ background: i <= step ? GRAD : "rgba(255,255,255,0.1)" }}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-white/40">
              Schritt {step + 1} von {TOTAL_STEPS}
            </p>
          </div>
        </div>
        <h2 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
          {stepTitles[step]}
        </h2>
        {selectedActivity && step > 0 ? (
          <p className="mt-1 text-sm text-white/40">
            {selectedActivity.icon} {selectedActivity.labelDe}
          </p>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={GLASS}
            >
              <Search size={18} className="text-white/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={S.searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                autoFocus
              />
            </div>

            {UI_ACTIVITY_CATEGORIES.map((cat) => {
              const items = grouped.get(cat.id) ?? [];
              if (items.length === 0) return null;
              return (
                <GCard key={cat.id} className="p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                    {cat.icon} {cat.labelDe}
                  </p>
                  <div className="flex flex-col gap-2">
                    {items.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => pickActivity(a.id)}
                        className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-white transition-all active:scale-[0.98]"
                        style={activityId === a.id ? { background: GRAD } : GLASS}
                      >
                        <span>
                          {a.icon} {a.labelDe}
                        </span>
                        {activityId === a.id ? <Check size={16} /> : null}
                      </button>
                    ))}
                  </div>
                </GCard>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <GCard className="p-5">
            <div className="grid grid-cols-3 gap-2">
              {S.durations.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => pickDuration(mins)}
                  className="rounded-2xl py-4 text-lg font-black text-white transition-all active:scale-95"
                  style={duration === mins && !showCustom ? { background: GRAD } : GLASS}
                >
                  {mins}
                  <span className="ml-1 text-xs font-bold text-white/50">{S.minutes}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={pickCustomDuration}
                className="rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-95"
                style={showCustom ? { background: GRAD } : GLASS}
              >
                {S.customDuration}
              </button>
            </div>

            {showCustom ? (
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Minuten"
                  className="flex-1 rounded-2xl px-4 py-3 text-white outline-none"
                  style={GLASS}
                />
                <GBtn
                  onClick={
                    customDuration && parseInt(customDuration, 10) >= 5
                      ? confirmCustomDuration
                      : undefined
                  }
                  style={
                    !customDuration || parseInt(customDuration, 10) < 5
                      ? { opacity: 0.45, pointerEvents: "none" }
                      : undefined
                  }
                >
                  OK
                </GBtn>
              </div>
            ) : null}
          </GCard>
        )}

        {step === 2 && (
          <GCard className="p-5">
            <div className="flex flex-col gap-2">
              {(["light", "moderate", "hard"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => pickIntensity(level)}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-bold text-white transition-all active:scale-[0.98]"
                  style={intensity === level ? { background: GRAD } : GLASS}
                >
                  {S.intensity[level]}
                  {intensity === level ? <Check size={16} /> : null}
                </button>
              ))}
            </div>
          </GCard>
        )}

        {step === 3 && (
          <GCard className="p-5">
            <p className="mb-3 text-xs text-white/40">{S.stepNoteHint}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 150))}
              rows={3}
              placeholder="…"
              className="w-full resize-none rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              style={GLASS}
            />
            <p className="mt-2 text-right text-xs text-white/30">{note.length}/150</p>
          </GCard>
        )}
      </div>

      {step === 3 ? (
        <div className="flex-shrink-0 px-6 pb-8 pt-2">
          <GBtn
            className="w-full"
            onClick={saving ? undefined : handleDone}
            style={saving ? { opacity: 0.6, pointerEvents: "none" } : undefined}
          >
            {saving ? "…" : S.done}
          </GBtn>
        </div>
      ) : null}
    </div>
  );
}
