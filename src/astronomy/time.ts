export const TIMELINE_LIMIT_HOURS = 6;
export const SIMULATED_MINUTES_PER_REAL_SECOND = 12;

export interface TimeAdvanceResult { date: Date; offsetHours: number; reachedBoundary: boolean }

export function dateAtOffset(anchor: Date, offsetHours: number): Date {
  return new Date(anchor.getTime() + offsetHours * 3_600_000);
}

export function advanceTime(
  date: Date,
  offsetHours: number,
  realDeltaSeconds: number,
  limitHours = TIMELINE_LIMIT_HOURS,
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
