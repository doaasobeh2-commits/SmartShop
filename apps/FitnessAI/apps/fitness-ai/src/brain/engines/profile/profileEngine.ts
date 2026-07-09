import type { UserProfile } from "../../../domain/models";
import type { BrainExplanation } from "../../types";

export type ProfileEngine = {
  validate(profile: UserProfile): { valid: boolean; issues: string[] };
  explain(profile: UserProfile): BrainExplanation;
};

export const profileEngine: ProfileEngine = {
  validate(profile) {
    const issues: string[] = [];
    if (profile.age < 16 || profile.age > 90) issues.push("Age outside supported planning range (16–90).");
    if (profile.weightKg < 40 || profile.weightKg > 160) issues.push("Weight outside supported planning range.");
    if (profile.heightCm < 140 || profile.heightCm > 220) issues.push("Height outside supported planning range.");
    return { valid: issues.length === 0, issues };
  },

  explain(profile) {
    return {
      id: "profile-baseline",
      engine: "profile",
      title: "Your profile baseline",
      summary: "Daily targets are personalised from your age, sex, size, activity, and goal.",
      steps: [
        { label: "Age", value: `${profile.age} years` },
        { label: "Sex", value: profile.gender },
        { label: "Height", value: `${profile.heightCm} cm` },
        { label: "Weight", value: `${profile.weightKg} kg` },
        { label: "Activity", value: profile.activityLevel },
        { label: "Goal", value: profile.goal },
      ],
      references: [],
    };
  },
};
