import { describe, expect, it } from "vitest";
import { constellations } from "../catalog/constellations";
import { constellationControlModel, constellationIdFromControlValue, updateTimeControls } from "./controls";

describe("playback time controls", () => {
  it("updates the mounted time display and slider in place", () => {
    const display = { textContent: "stale" };
    const slider = { value: "0", max: "0" };
    const root = {
      querySelector: (selector: string) => selector === "[data-time-display]" ? display : slider,
    } as unknown as ParentNode;
    const now = new Date("2026-08-02T12:34:00Z");

    updateTimeControls(root, {
      now,
      offsetHours: 1.25,
      anchorTime: new Date("2026-08-02T15:00:00Z"),
      replayEnd: new Date("2026-08-03T00:00:00Z"),
    });

    expect(display.textContent).toBe(now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }));
    expect(slider.value).toBe("1.25");
    expect(slider.max).toBe("9");
  });

  it("is safe when controls are not mounted", () => {
    const root = { querySelector: () => null } as unknown as ParentNode;
    expect(() => updateTimeControls(root, {
      now: new Date(),
      offsetHours: 2,
      anchorTime: new Date("2026-08-02T00:00:00Z"),
      replayEnd: new Date("2026-08-03T00:00:00Z"),
    })).not.toThrow();
  });
});

describe("constellation control model", () => {
  it("starts with overview followed by catalogue IDs and labels", () => {
    expect(constellationControlModel({ selectedConstellationId: null }, constellations)).toEqual({
      selectedValue: "",
      options: [
        { value: "", label: "Sky overview" },
        { value: "cygnus", label: "Cygnus · Northern Cross" },
        { value: "scorpius", label: "Scorpius" },
        { value: "sagittarius", label: "Sagittarius · Teapot" },
      ],
      dimContextDisabled: true,
    });
  });

  it("reflects focus and maps native select values at the action boundary", () => {
    expect(constellationControlModel({ selectedConstellationId: "cygnus" }, constellations)).toMatchObject({
      selectedValue: "cygnus",
      dimContextDisabled: false,
    });
    expect(constellationIdFromControlValue("")).toBeNull();
    expect(constellationIdFromControlValue("cygnus")).toBe("cygnus");
    expect(constellationIdFromControlValue("scorpius")).toBe("scorpius");
    expect(constellationIdFromControlValue("sagittarius")).toBe("sagittarius");
  });

  it("treats a stale selected ID as overview", () => {
    expect(constellationControlModel({ selectedConstellationId: "stale-id" }, constellations)).toMatchObject({
      selectedValue: "",
      dimContextDisabled: true,
    });
  });
});
