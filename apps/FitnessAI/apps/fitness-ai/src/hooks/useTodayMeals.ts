import { useCallback, useEffect, useState } from "react";

import type { MealEntry } from "../domain/models";

import { nutritionRepository } from "../data/repositories/mockRepositories";

import { subscribeBrainDataRefresh } from "./brainDataRefresh";



export function useTodayMeals() {

  const [meals, setMeals] = useState<MealEntry[]>([]);

  const [loading, setLoading] = useState(true);



  const refresh = useCallback(async () => {

    const data = await nutritionRepository.getTodayMeals();

    setMeals(data);

    setLoading(false);

    return data;

  }, []);



  useEffect(() => {

    void refresh();

  }, [refresh]);



  useEffect(() => subscribeBrainDataRefresh(() => {

    void refresh();

  }), [refresh]);



  return { meals, loading, refresh };

}


