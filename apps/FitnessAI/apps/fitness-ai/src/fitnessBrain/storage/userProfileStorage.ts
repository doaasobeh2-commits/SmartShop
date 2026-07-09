/**

 * Persists app user profile — installation scoped, no seeded demo data.

 */



import type { UserProfile } from "../../domain/models";

import {

  readInstallationScoped,

  writeInstallationScoped,

} from "../privacy/brainInstallationStorage";



export const USER_PROFILE_STORAGE_KEY = "app:user-profile";



function todayIsoDate(): string {

  return new Date().toISOString().slice(0, 10);

}



export function createEmptyUserProfile(): UserProfile {

  return {

    id: `local-${Date.now()}`,

    displayName: "",

    email: "",

    goal: "fit",

    gender: "other",

    activityLevel: "mod",

    heightCm: 0,

    weightKg: 0,

    age: 0,

    lang: "de",

    streakDays: 0,

    memberSince: todayIsoDate(),

  };

}



export function loadUserProfile(): UserProfile | null {

  return readInstallationScoped<UserProfile>(USER_PROFILE_STORAGE_KEY);

}



export function saveUserProfile(profile: UserProfile): UserProfile {

  writeInstallationScoped(USER_PROFILE_STORAGE_KEY, profile);

  return profile;

}



export function patchUserProfile(patch: Partial<UserProfile>): UserProfile {

  const current = loadUserProfile() ?? createEmptyUserProfile();

  const next = { ...current, ...patch };

  return saveUserProfile(next);

}


