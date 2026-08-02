import { IDENTITY_CALIBRATION } from "../rendering/calibration";
import type { Calibration } from "../types";

export const CALIBRATION_STORAGE_KEY = "ceilingSky.calibration";

const limits: Record<"rotationDegrees" | "scale" | "offsetX" | "offsetY" | "horizonScale", readonly [number, number]> = {
  rotationDegrees: [-180, 180], scale: [0.5, 1.5], offsetX: [-0.5, 0.5], offsetY: [-0.5, 0.5], horizonScale: [0.5, 1.5],
};

function validNumber(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

export function validateCalibration(value: unknown): Calibration {
  const data = value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    rotationDegrees: validNumber(data.rotationDegrees, 0, ...limits.rotationDegrees),
    scale: validNumber(data.scale, 1, ...limits.scale),
    offsetX: validNumber(data.offsetX, 0, ...limits.offsetX),
    offsetY: validNumber(data.offsetY, 0, ...limits.offsetY),
    mirrorX: typeof data.mirrorX === "boolean" ? data.mirrorX : false,
    mirrorY: typeof data.mirrorY === "boolean" ? data.mirrorY : false,
    horizonScale: validNumber(data.horizonScale, 1, ...limits.horizonScale),
  };
}

export function loadCalibration(storage: Pick<Storage, "getItem"> = localStorage): { calibration: Calibration; error: string | null } {
  try {
    const raw = storage.getItem(CALIBRATION_STORAGE_KEY);
    return { calibration: raw === null ? { ...IDENTITY_CALIBRATION } : validateCalibration(JSON.parse(raw)), error: null };
  } catch {
    return { calibration: { ...IDENTITY_CALIBRATION }, error: "Could not load saved calibration; using defaults." };
  }
}

export function saveCalibration(calibration: Calibration, storage: Pick<Storage, "setItem"> = localStorage): string | null {
  try {
    storage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibration));
    return null;
  } catch {
    return "Calibration is active but could not be saved in this browser.";
  }
}
