import { Horizon } from "astronomy-engine";
import type { HorizontalCoordinate, ObserverLocation, Star } from "../types";
import { astronomyObserver, RIYADH } from "./observer";

export type HorizonCalculator = (
  date: Date,
  observer: ReturnType<typeof astronomyObserver>,
  raHours: number,
  declinationDegrees: number,
  refraction: "normal",
) => { altitude: number; azimuth: number };

/** Passes catalog RA/declination directly to Astronomy Engine. */
export function starToHorizontal(
  star: Star,
  date: Date,
  location: ObserverLocation = RIYADH,
  calculate: HorizonCalculator = Horizon,
): HorizontalCoordinate {
  const result = calculate(
    date,
    astronomyObserver(location),
    star.raHours,
    star.declinationDegrees,
    "normal",
  );
  return { altitudeDegrees: result.altitude, azimuthDegrees: result.azimuth };
}
