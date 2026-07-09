import { useCallback, useEffect, useState } from "react";

import type { DailyPlan } from "../domain/models";

import { dailyPlanService } from "../services/dailyPlanService";

import { subscribeBrainDataRefresh } from "./brainDataRefresh";



export function useDailyPlan() {

  const [plan, setPlan] = useState<DailyPlan | null>(null);

  const [loading, setLoading] = useState(true);



  const reload = useCallback(() => {

    setLoading(true);

    return dailyPlanService.getToday().then((data) => {

      setPlan(data);

      setLoading(false);

    });

  }, []);



  useEffect(() => {

    let active = true;

    reload().then(() => {

      if (!active) return;

    });

    return () => {

      active = false;

    };

  }, [reload]);



  useEffect(() => subscribeBrainDataRefresh(() => {

    void reload();

  }), [reload]);



  return { plan, loading, reload };

}


