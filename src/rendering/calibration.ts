import type { Calibration, ScreenPoint, SkyViewVector } from "../types";

export const IDENTITY_CALIBRATION: Readonly<Calibration> = {
  rotationDegrees: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  mirrorX: false,
  mirrorY: false,
  horizonScale: 1,
};

export function logicalRadius(width: number, height: number, calibration: Calibration): number {
  return Math.min(width, height) * 0.46 * calibration.horizonScale;
}

/** Mirrors → clockwise rotation → scale → normalized translation → viewport centre. */
export function applyCalibration(
  vector: SkyViewVector,
  width: number,
  height: number,
  calibration: Calibration,
): ScreenPoint {
  let x = vector.x * (calibration.mirrorX ? -1 : 1);
  let y = vector.y * (calibration.mirrorY ? -1 : 1);
  const radians = (calibration.rotationDegrees * Math.PI) / 180;
  const rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
  const rotatedY = x * Math.sin(radians) + y * Math.cos(radians);
  x = rotatedX * calibration.scale;
  y = rotatedY * calibration.scale;
  const shorter = Math.min(width, height);
  return {
    x: width / 2 + x + calibration.offsetX * shorter,
    y: height / 2 + y + calibration.offsetY * shorter,
    visible: true,
  };
}
