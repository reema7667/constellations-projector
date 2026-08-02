import { describe, expect, it, vi } from "vitest";
import { starToHorizontal, type HorizonCalculator } from "./coordinates";
import { stars } from "../catalog/stars";

describe("catalog to Astronomy Engine contract", () => {
  it("passes stored RA and declination through unchanged", () => {
    const star = stars[0]!;
    const calculator = vi.fn<HorizonCalculator>(() => ({ altitude: 42, azimuth: 123 }));
    expect(starToHorizontal(star, new Date("2026-01-01T00:00:00Z"), undefined, calculator)).toEqual({ altitudeDegrees: 42, azimuthDegrees: 123 });
    expect(calculator.mock.calls[0]?.[2]).toBe(star.raHours);
    expect(calculator.mock.calls[0]?.[3]).toBe(star.declinationDegrees);
  });
});
