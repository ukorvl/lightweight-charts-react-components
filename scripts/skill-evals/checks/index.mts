#!/usr/bin/env node
// Explicit extension registry: add a checker here and a case to evals.json.
// Keeping registry entries explicit avoids importing arbitrary paths from manifests.
import { verifyHistory } from "./history.mts";
import { verifyLive } from "./live.mts";
import { verifyVolume } from "./volume.mts";
import type { ScenarioChecker } from "../browser.mts";

export const checkers: Record<string, ScenarioChecker> = {
  "live-candles": verifyLive,
  history: verifyHistory,
  volume: verifyVolume,
};
