import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "../domain/models";
import type { BrainCompletenessFactor } from "../fitnessBrain/lifestyle";
import { buildLifestyleIntelligence } from "../fitnessBrain/lifestyle";
import { buildUserProfile } from "../fitnessBrain/userProfileEngine";
import { getBehaviorLogs } from "../fitnessBrain/storage/behaviorSignals";

export function useBrainCompleteness(profile: UserProfile | null): {
  score: number | null;
  factors: BrainCompletenessFactor[];
  refresh: () => void;
} {
  const [score, setScore] = useState<number | null>(null);
  const [factors, setFactors] = useState<BrainCompletenessFactor[]>([]);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!profile) {
      setScore(null);
      setFactors([]);
      return;
    }

    const userProfile = buildUserProfile({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      goal: profile.goal,
      activityLevel: profile.activityLevel,
      experienceLevel: profile.experienceLevel,
      trainingDays: profile.trainingDays,
      foodPreferences: profile.foodPreferences,
    });

    const intelligence = buildLifestyleIntelligence({
      appProfile: profile,
      behaviorLogs: getBehaviorLogs(),
      userProfile,
    });

    setScore(intelligence.completeness.score);
    setFactors(intelligence.completeness.factors);
  }, [profile, tick]);

  return { score, factors, refresh };
}
