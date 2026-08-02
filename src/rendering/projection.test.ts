import { describe, expect, it } from "vitest";
import { applyCalibration, IDENTITY_CALIBRATION, logicalRadius } from "./calibration";
import { compassToSkyViewVector, horizontalToCompassVector, altitudeToRadius } from "./projection";
import { projectHorizontal, visibleEdges, type ProjectedStar } from "./skyRenderer";
import { cygnus } from "../catalog/constellations";
import { starsById } from "../catalog/stars";

const close = (value: number, expected: number) => expect(value).toBeCloseTo(expected, 8);

describe("projection conventions", () => {
  it("maps east right canonically and left only in sky view", () => {
    const compass = horizontalToCompassVector({ altitudeDegrees: 0, azimuthDegrees: 90 }, 100);
    close(compass.x, 100); close(compass.y, 0);
    const sky = compassToSkyViewVector(compass); close(sky.x, -100); close(sky.y, 0);
  });
  it("maps west left canonically and right in sky view", () => {
    const compass = horizontalToCompassVector({ altitudeDegrees: 0, azimuthDegrees: 270 }, 100);
    close(compass.x, -100); close(compassToSkyViewVector(compass).x, 100);
  });
  it("keeps identity calibration unmirrored", () => {
    expect(applyCalibration({ x: 20, y: -10 }, 200, 100, { ...IDENTITY_CALIBRATION })).toMatchObject({ x: 120, y: 40 });
  });
  it("maps zenith to centre, horizon to logical circle, and hides below-horizon points", () => {
    const calibration = { ...IDENTITY_CALIBRATION };
    expect(projectHorizontal({ altitudeDegrees: 90, azimuthDegrees: 5 }, 800, 600, calibration)).toMatchObject({ x: 400, y: 300, visible: true });
    const horizon = projectHorizontal({ altitudeDegrees: 0, azimuthDegrees: 0 }, 800, 600, calibration);
    close(Math.hypot(horizon.x - 400, horizon.y - 300), logicalRadius(800, 600, calibration));
    expect(projectHorizontal({ altitudeDegrees: -0.01, azimuthDegrees: 0 }, 800, 600, calibration).visible).toBe(false);
    expect(altitudeToRadius(90, 100)).toBe(0);
  });
});

describe("calibration composition", () => {
  it("applies mirrors, clockwise rotation, scale, normalized translation in order", () => {
    const result = applyCalibration({ x: 10, y: 5 }, 200, 100, {
      rotationDegrees: 90, scale: 2, offsetX: 0.1, offsetY: -0.2,
      mirrorX: true, mirrorY: true, horizonScale: 1,
    });
    close(result.x, 120); close(result.y, 10);
  });
  it("supports each mirror independently", () => {
    expect(applyCalibration({ x: 10, y: 5 }, 100, 100, { ...IDENTITY_CALIBRATION, mirrorX: true })).toMatchObject({ x: 40, y: 55 });
    expect(applyCalibration({ x: 10, y: 5 }, 100, 100, { ...IDENTITY_CALIBRATION, mirrorY: true })).toMatchObject({ x: 60, y: 45 });
  });
  it("normalizes offsets by the shorter viewport dimension", () => {
    const calibration = { ...IDENTITY_CALIBRATION, offsetX: 0.25 };
    expect(applyCalibration({ x: 0, y: 0 }, 800, 400, calibration).x - 400).toBe(100);
    expect(applyCalibration({ x: 0, y: 0 }, 400, 800, calibration).x - 200).toBe(100);
  });
  it("uses horizon scale only when establishing logical radius", () => {
    expect(logicalRadius(1000, 500, { ...IDENTITY_CALIBRATION, horizonScale: 1.5 })).toBe(345);
  });
});

describe("edge visibility", () => {
  it("omits an edge if either endpoint is invisible", () => {
    const projected = new Map<string, ProjectedStar>();
    for (const id of cygnus.starIds) {
      projected.set(id, { star: starsById.get(id)!, horizontal: { altitudeDegrees: 1, azimuthDegrees: 1 }, point: { x: 1, y: 1, visible: id !== "sadr" } });
    }
    expect(visibleEdges(cygnus, projected)).toHaveLength(0);
    projected.get("sadr")!.point.visible = true;
    expect(visibleEdges(cygnus, projected)).toHaveLength(4);
  });
});
