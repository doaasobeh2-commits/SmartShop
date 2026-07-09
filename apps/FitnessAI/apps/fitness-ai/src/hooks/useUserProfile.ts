import { useEffect, useState } from "react";
import type { UserProfile } from "../domain/models";
import { userProfileRepository } from "../data/repositories/mockRepositories";
import { subscribeBrainDataRefresh } from "./brainDataRefresh";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = () => userProfileRepository.getProfile().then(setProfile);
    load();
    return subscribeBrainDataRefresh(load);
  }, []);

  return { profile };
}
