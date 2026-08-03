import { Body, SearchAltitude } from "astronomy-engine";
import { astronomyObserver } from "./observer";
import type { ReplayRange, ReplayWindow } from "../types";

export const SIMULATED_MINUTES_PER_REAL_SECOND = 12;
const ASTRONOMICAL_TWILIGHT_DEGREES = -18;

export interface TimeAdvanceResult { date: Date; offsetHours: number; reachedBoundary: boolean }

export function dateAtOffset(anchor: Date, offsetHours: number): Date {
  return new Date(anchor.getTime() + offsetHours * 3_600_000);
}

export function replayWindow(reference: Date, range: ReplayRange): ReplayWindow {
  const startOfDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  if (range === "day") {
    return {
      start: startOfDay,
      end: new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() + 1),
    };
  }

  const noon = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), 12);
  const observer = astronomyObserver();
  const dusk = SearchAltitude(Body.Sun, observer, -1, noon, 1, ASTRONOMICAL_TWILIGHT_DEGREES);
  if (!dusk) throw new Error("Could not calculate astronomical dusk for Riyadh.");
  const dawn = SearchAltitude(Body.Sun, observer, 1, dusk.date, 1, ASTRONOMICAL_TWILIGHT_DEGREES);
  if (!dawn) throw new Error("Could not calculate astronomical dawn for Riyadh.");
  return { start: dusk.date, end: dawn.date };
}

export function replayDurationHours(window: ReplayWindow): number {
  return (window.end.getTime() - window.start.getTime()) / 3_600_000;
}

export function advanceTime(
  date: Date,
  offsetHours: number,
  realDeltaSeconds: number,
  limitHours: number,
): TimeAdvanceResult {
  const simulatedHours = (realDeltaSeconds * SIMULATED_MINUTES_PER_REAL_SECOND) / 60;
  const nextOffset = Math.min(limitHours, offsetHours + simulatedHours);
  const appliedHours = nextOffset - offsetHours;
  return {
    date: new Date(date.getTime() + appliedHours * 3_600_000),
    offsetHours: nextOffset,
    reachedBoundary: nextOffset >= limitHours,
  };
}
