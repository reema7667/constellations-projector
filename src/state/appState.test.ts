import { describe, expect, it } from "vitest";
import { replayWindow } from "../astronomy/time";
import { constellationSelectionPatch, createAppState } from "./appState";

describe("application time replay state", () => {
  it("starts at dusk with the dusk-to-dawn range selected", () => {
    const reference = new Date(2026, 7, 2, 9);
    const expected = replayWindow(reference, "night");

    const state = createAppState(reference);

    expect(state.replayRange).toBe("night");
    expect(state.now.getTime()).toBe(expected.start.getTime());
    expect(state.anchorTime.getTime()).toBe(expected.start.getTime());
    expect(state.replayEnd.getTime()).toBe(expected.end.getTime());
    expect(state.offsetHours).toBe(0);
    expect(state.selectedConstellationId).toBeNull();
    expect(state.showConstellationLines).toBe(false);
    expect(state.showLabels).toBe(true);
    expect(state.dimContext).toBe(false);
  });
});

describe("constellation focus state", () => {
  it("atomically enables dimming for a selection and clears it for overview", () => {
    expect(constellationSelectionPatch("cygnus")).toEqual({
      selectedConstellationId: "cygnus",
      dimContext: true,
    });
    expect(constellationSelectionPatch(null)).toEqual({
      selectedConstellationId: null,
      dimContext: false,
    });
  });
});
