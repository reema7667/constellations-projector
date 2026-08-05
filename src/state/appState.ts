import { IDENTITY_CALIBRATION } from "../rendering/calibration";
import { replayWindow } from "../astronomy/time";
import type { AppState } from "../types";

export function createAppState(now = new Date()): AppState {
  const window = replayWindow(now, "night");
  return {
    now: window.start, anchorTime: window.start, offsetHours: 0, playing: false,
    replayRange: "night", replayEnd: window.end,
    selectedConstellationId: null,
    showLabels: true, showConstellationLines: false, dimContext: false, calibrationMode: false,
    projectionMode: false, controlsVisible: true, message: null,
    calibration: { ...IDENTITY_CALIBRATION },
  };
}

export function constellationSelectionPatch(selectedConstellationId: string | null): Pick<AppState, "selectedConstellationId" | "dimContext"> {
  return { selectedConstellationId, dimContext: selectedConstellationId !== null };
}
