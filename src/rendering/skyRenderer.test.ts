import { describe, expect, it } from "vitest";
import { cygnus } from "../catalog/constellations";
import { starsById } from "../catalog/stars";
import { IDENTITY_CALIBRATION } from "./calibration";
import { renderSky, type ProjectedStar } from "./skyRenderer";
import { theme } from "./theme";

interface ContextRecording {
  fills: string[];
  radii: number[];
  strokes: number;
  labels: string[];
}

function recordingContext(): { ctx: CanvasRenderingContext2D; recording: ContextRecording } {
  const recording: ContextRecording = { fills: [], radii: [], strokes: 0, labels: [] };
  let currentRadius = 0;
  const context = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    font: "",
    textAlign: "start",
    fillRect: () => undefined,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    arc: (_x: number, _y: number, radius: number) => { currentRadius = radius; },
    fill: function (this: { fillStyle: unknown }) {
      recording.fills.push(String(this.fillStyle));
      recording.radii.push(currentRadius);
    },
    stroke: () => { recording.strokes += 1; },
    fillText: (label: string) => { recording.labels.push(label); },
  } as unknown as CanvasRenderingContext2D;
  return { ctx: context, recording };
}

function projected(id: string, visible = true): ProjectedStar {
  return {
    star: starsById.get(id)!,
    horizontal: { altitudeDegrees: visible ? 30 : -1, azimuthDegrees: 0 },
    point: { x: 10, y: 10, visible },
  };
}

const options = {
  showLabels: true,
  showConstellationLines: true,
  dimContext: true,
  calibrationMode: false,
  calibration: { ...IDENTITY_CALIBRATION },
};

describe("sky focus rendering", () => {
  it("renders an overview without focus dimming, edges, or focus-only labels", () => {
    const { ctx, recording } = recordingContext();

    renderSky(ctx, 800, 600, [projected("deneb"), projected("vega")], null, options);

    expect(recording.fills).toEqual([theme.context, theme.context]);
    expect(recording.strokes).toBe(0);
    expect(recording.labels).toEqual([]);
  });

  it("derives focus from constellation star IDs and dims only visible nonmembers", () => {
    const { ctx, recording } = recordingContext();

    renderSky(ctx, 800, 600, [projected("deneb"), projected("vega"), projected("sadr", false)], cygnus, {
      ...options,
      showConstellationLines: false,
    });

    expect(recording.fills).toEqual([theme.focused, theme.dimmed]);
    expect(recording.radii).toEqual([
      Math.max(1.2, 4.8 - starsById.get("deneb")!.magnitude * 0.85),
      Math.max(1.2, 4.8 - starsById.get("vega")!.magnitude * 0.85),
    ]);
    expect(recording.strokes).toBe(0);
    expect(recording.labels).toEqual(["Deneb"]);
  });

  it("draws segments only when lines are enabled and both endpoints are visible", () => {
    const projectedStars = [projected("deneb"), projected("sadr")];
    const off = recordingContext();
    const on = recordingContext();

    renderSky(off.ctx, 800, 600, projectedStars, cygnus, { ...options, showConstellationLines: false });
    renderSky(on.ctx, 800, 600, projectedStars, cygnus, { ...options, showConstellationLines: true });

    expect(off.recording.strokes).toBe(0);
    expect(on.recording.strokes).toBe(1);
  });
});
