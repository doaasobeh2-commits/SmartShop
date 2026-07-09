import { useEffect, useState } from "react";

import { buildFitnessBrainUserData } from "../fitnessBrain/buildBrainInput";

import { generateFitnessBrainState } from "../fitnessBrain/fitnessBrain";

import { getRecentActivityLogs } from "../fitnessBrain/activity";

import { getBehaviorLogs } from "../fitnessBrain/storage/behaviorSignals";

import {

  getSmartFocusLabel,

  localizeDailyAction,

  type FitnessBrainLocale,

  type LocalizedDailyAction,

} from "../fitnessBrain/i18n/strings";

import type { FitnessBrainState } from "../fitnessBrain/types";

import { requestBrainDataRefresh, subscribeBrainDataRefresh } from "./brainDataRefresh";



export type UseFitnessBrainResult = {

  state: FitnessBrainState | null;

  smartFocus: LocalizedDailyAction | null;

  smartFocusLabel: string;

  loading: boolean;

  refresh: () => void;

};



/** @deprecated Use requestBrainDataRefresh */

export const requestBrainRefresh = requestBrainDataRefresh;



export function useFitnessBrain(locale: FitnessBrainLocale = "de"): UseFitnessBrainResult {

  const [state, setState] = useState<FitnessBrainState | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);



  useEffect(() => {

    const bump = () => setRefreshKey((k) => k + 1);

    return subscribeBrainDataRefresh(bump);

  }, []);



  useEffect(() => {

    let active = true;

    setLoading(true);

    buildFitnessBrainUserData().then((userData) => {

      if (!active) return;

      setState(

        generateFitnessBrainState(userData, {

          behaviorLogs: getBehaviorLogs(),

          activityLogs: getRecentActivityLogs(),

        }),

      );

      setLoading(false);

    });

    return () => {

      active = false;

    };

  }, [refreshKey]);



  const smartFocus = state

    ? localizeDailyAction(state.dailyAction.id, state.dailyAction.params, locale)

    : null;



  return {

    state,

    smartFocus,

    smartFocusLabel: getSmartFocusLabel(locale),

    loading,

    refresh: requestBrainDataRefresh,

  };

}


