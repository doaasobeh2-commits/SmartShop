import type { ActivityLevel, ExperienceLevel, Gender, UserGoal } from "../domain/models";

import type { Lang } from "@fitness-ai/core/types";

import type { PrimarySportId } from "../fitnessBrain/i18n/sportStrings";

import { requestBrainDataRefresh } from "../hooks/brainDataRefresh";
import { updateLifestyleProfile } from "../fitnessBrain/lifestyle";

import { userProfileRepository } from "../data/repositories/mockRepositories";

/** Matches Fitness Brain user paths — lifestyle mode when no primary sport is set. */
export type OnboardingPath = "healthy_lifestyle" | "beginner_exercise" | "existing_athlete";

export type OnboardingData = {
  goal: UserGoal;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  lang: Lang;
  path: OnboardingPath;
  primarySport?: PrimarySportId;
  experienceLevel?: ExperienceLevel;
};

export type OnboardingService = {
  save(data: OnboardingData): Promise<void>;
};

export const onboardingService: OnboardingService = {
  async save(data) {
    await userProfileRepository.saveProfile({
      goal: data.goal,
      gender: data.gender,
      activityLevel: data.activityLevel,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      age: data.age,
      lang: data.lang,
      ...(data.experienceLevel ? { experienceLevel: data.experienceLevel } : {}),
    });

    if (data.primarySport) {
      updateLifestyleProfile({
        training: {
          primarySport: data.primarySport,
          favouriteSports: [data.primarySport],
        },
      });
    }

    requestBrainDataRefresh();
  },
};
