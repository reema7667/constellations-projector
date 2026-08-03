import { describe, expect, it } from "vitest";
import { Body, Equator, Horizon } from "astronomy-engine";
import { astronomyObserver } from "./observer";
import { advanceTime, replayDurationHours, replayWindow } from "./time";

function sunAltitude(date: Date): number {
  const observer = astronomyObserver();
  const equatorial = Equator(Body.Sun, date, observer, true, true);
  return Horizon(date, observer, equatorial.ra, equatorial.dec).altitude;
}

describe("simulation time", () => {
  it("advances twelve simulated minutes per real second", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const result = advanceTime(start, 0, 5, 6);
    expect(result.date.toISOString()).toBe("2026-01-01T01:00:00.000Z"); expect(result.offsetHours).toBe(1); expect(result.reachedBoundary).toBe(false);
  });
  it("stops exactly at the upper boundary", () => {
    const result = advanceTime(new Date("2026-01-01T05:54:00Z"), 5.9, 10, 6);
    expect(result.offsetHours).toBe(6); expect(result.date.toISOString()).toBe("2026-01-01T06:00:00.000Z"); expect(result.reachedBoundary).toBe(true);
  });

  it("creates a night window from astronomical dusk through the following dawn", () => {
    const window = replayWindow(new Date(2026, 7, 2, 9), "night");
    const minute = 60_000;

    expect(window.start.getTime()).toBeLessThan(window.end.getTime());
    expect(sunAltitude(new Date(window.start.getTime() - minute))).toBeGreaterThan(-18);
    expect(sunAltitude(new Date(window.start.getTime() + minute))).toBeLessThan(-18);
    expect(sunAltitude(new Date(window.end.getTime() - minute))).toBeLessThan(-18);
    expect(sunAltitude(new Date(window.end.getTime() + minute))).toBeGreaterThan(-18);
    expect(replayDurationHours(window)).toBeGreaterThan(7);
    expect(replayDurationHours(window)).toBeLessThan(12);
  });

  it("creates a midnight-to-midnight 24-hour window", () => {
    const window = replayWindow(new Date(2026, 7, 2, 14, 30), "day");

    expect(window.start.getHours()).toBe(0);
    expect(window.start.getMinutes()).toBe(0);
    expect(replayDurationHours(window)).toBe(24);
  });
});
