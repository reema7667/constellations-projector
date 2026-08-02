import { Observer } from "astronomy-engine";
import type { ObserverLocation } from "../types";

export const RIYADH: ObserverLocation = {
  latitude: 24.7136,
  longitude: 46.6753,
  elevationMeters: 612,
};

export function astronomyObserver(location: ObserverLocation = RIYADH): Observer {
  return new Observer(location.latitude, location.longitude, location.elevationMeters);
}
