import { IDENTITY_CALIBRATION } from "../rendering/calibration";
import type { AppState } from "../types";

export function createAppState(now = new Date()): AppState {
  return {
    now, anchorTime: new Date(now), offsetHours: 0, playing: false,
    showLabels: true, dimContext: false, calibrationMode: false,
    projectionMode: false, controlsVisible: true, message: null,
    calibration: { ...IDENTITY_CALIBRATION },
  };
}
