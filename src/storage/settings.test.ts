import { describe, expect, it } from "vitest";
import { loadCalibration, saveCalibration, validateCalibration } from "./settings";

describe("calibration persistence", () => {
  it("defaults malformed fields and clamps finite out-of-range values", () => {
    expect(validateCalibration({ rotationDegrees: 900, scale: -2, offsetX: "0.2", offsetY: Infinity, mirrorX: "true", mirrorY: true, horizonScale: 1.2 })).toEqual({
      rotationDegrees: 180, scale: 0.5, offsetX: 0, offsetY: 0, mirrorX: false, mirrorY: true, horizonScale: 1.2,
    });
  });
  it("recovers from malformed JSON and storage failures", () => {
    const loaded = loadCalibration({ getItem: () => "{" });
    expect(loaded.calibration.scale).toBe(1); expect(loaded.error).not.toBeNull();
    expect(saveCalibration(loaded.calibration, { setItem: () => { throw new Error("denied"); } })).toContain("could not be saved");
  });
});
