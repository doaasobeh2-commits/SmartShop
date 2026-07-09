/**
 * Future engine placeholders — interfaces only, no logic yet.
 * Enables long-term growth without UI changes.
 */

import type { EngineId } from "../../types";

export type FutureEngineStub = {
  id: EngineId;
  status: "planned";
  description: string;
};

export const FUTURE_ENGINES: FutureEngineStub[] = [
  { id: "sleep", status: "planned", description: "Sleep duration/quality inputs for recovery and energy targets." },
  { id: "recovery", status: "planned", description: "Training load, HRV, soreness — deload and rest-day rules." },
  { id: "stress", status: "planned", description: "Stress markers to modulate intensity and nutrition flexibility." },
  { id: "health", status: "planned", description: "Biomarkers and conditions with safe planning constraints." },
  { id: "supplement", status: "planned", description: "Evidence-graded supplement suggestions when profile allows." },
];
