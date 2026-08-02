import type { CompassVector, HorizontalCoordinate, SkyViewVector } from "../types";

export function altitudeToRadius(altitudeDegrees: number, logicalRadius: number): number {
  return ((90 - altitudeDegrees) / 90) * logicalRadius;
}

/** Conventional compass plane: north up, east right. */
export function horizontalToCompassVector(
  coordinate: HorizontalCoordinate,
  logicalRadius: number,
): CompassVector {
  const radius = altitudeToRadius(coordinate.altitudeDegrees, logicalRadius);
  const azimuthRadians = (coordinate.azimuthDegrees * Math.PI) / 180;
  return {
    x: Math.sin(azimuthRadians) * radius,
    y: -Math.cos(azimuthRadians) * radius,
  };
}

/** Inside-the-sphere sky view: fixed east-left conversion. */
export function compassToSkyViewVector(vector: CompassVector): SkyViewVector {
  return { x: -vector.x, y: vector.y };
}

export function isAboveHorizon(coordinate: HorizontalCoordinate): boolean {
  return coordinate.altitudeDegrees >= 0;
}
