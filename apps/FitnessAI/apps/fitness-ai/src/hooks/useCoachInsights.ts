import { useCallback, useEffect, useState } from "react";

import type { CoachInsight } from "../domain/models";

import { coachService } from "../services/coachService";

import { subscribeBrainDataRefresh } from "./brainDataRefresh";



export function useCoachInsights() {

  const [insights, setInsights] = useState<CoachInsight[]>([]);

  const [loading, setLoading] = useState(true);



  const reload = useCallback(async () => {

    const data = await coachService.getDailyInsights();

    setInsights(data);

    setLoading(false);

    return data;

  }, []);



  useEffect(() => {

    void reload();

  }, [reload]);



  useEffect(() => subscribeBrainDataRefresh(() => {

    void reload();

  }), [reload]);



  return { insights, loading, reload };

}


