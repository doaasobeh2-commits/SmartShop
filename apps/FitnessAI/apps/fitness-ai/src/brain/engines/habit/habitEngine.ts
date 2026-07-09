import type { UserProfile } from "../../../domain/models";
import type { Explainable, HydrationTargets } from "../../types";
import { dailyWaterLiters } from "../../science/formulas";
import { SCIENCE_REFERENCES } from "../../science/references";

export type HabitEngine = {
  hydration(profile: UserProfile, consumedLiters: number): Explainable<HydrationTargets>;
  streakInsight(streakDays: number): { message: string; ruleId: string } | null;
};

export const habitEngine: HabitEngine = {
  hydration(profile, consumedLiters) {
    const goalLiters = dailyWaterLiters(profile.weightKg);
    const remainingLiters = Math.max(Math.round((goalLiters - consumedLiters) * 10) / 10, 0);

    return {
      value: { goalLiters, consumedLiters, remainingLiters },
      explanation: {
        id: "habit-hydration",
        engine: "habit",
        title: "Water target",
        summary: `Aim for ${goalLiters} L based on body weight; you've had ${consumedLiters} L so far.`,
        steps: [
          {
            label: "Formula",
            value: "35 ml × kg body weight (min 2.0 L)",
            formula: `${profile.weightKg} kg → ${goalLiters} L`,
          },
          { label: "Consumed today", value: `${consumedLiters} L` },
          { label: "Remaining", value: `${remainingLiters} L` },
        ],
        references: [SCIENCE_REFERENCES.EFSA_WATER],
      },
    };
  },

  streakInsight(streakDays) {
    if (streakDays >= 7) {
      return {
        message: `${streakDays}-day streak — consistency compounds.`,
        ruleId: "habit-streak-milestone",
      };
    }
    return null;
  },
};
