import { describe, expect, it } from "vitest";
import { advanceTime } from "./time";

describe("simulation time", () => {
  it("advances twelve simulated minutes per real second", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const result = advanceTime(start, 0, 5);
    expect(result.date.toISOString()).toBe("2026-01-01T01:00:00.000Z"); expect(result.offsetHours).toBe(1); expect(result.reachedBoundary).toBe(false);
  });
  it("stops exactly at the upper boundary", () => {
    const result = advanceTime(new Date("2026-01-01T05:54:00Z"), 5.9, 10);
    expect(result.offsetHours).toBe(6); expect(result.date.toISOString()).toBe("2026-01-01T06:00:00.000Z"); expect(result.reachedBoundary).toBe(true);
  });
});
