import type { Star } from "../types";

/**
 * ICRS/J2000 coordinates and V magnitudes, transcribed from SIMBAD.
 * Values remain in their conventional astronomical coordinate system.
 * Accessed for this catalog: 2025-02-24.
 */
export const stars: readonly Star[] = [
  { id: "deneb", name: "Deneb", raHours: 20.690531, declinationDegrees: 45.280338, magnitude: 1.25, constellationId: "cygnus" },
  { id: "sadr", name: "Sadr", raHours: 20.370473, declinationDegrees: 40.256679, magnitude: 2.23, constellationId: "cygnus" },
  { id: "albireo", name: "Albireo", raHours: 19.512023, declinationDegrees: 27.959681, magnitude: 3.05, constellationId: "cygnus" },
  { id: "delta-cygni", name: "Delta Cygni", raHours: 19.749574, declinationDegrees: 45.13081, magnitude: 2.87, constellationId: "cygnus" },
  { id: "gienah", name: "Gienah", raHours: 20.770178, declinationDegrees: 33.970257, magnitude: 2.46, constellationId: "cygnus" },
  { id: "vega", name: "Vega", raHours: 18.615649, declinationDegrees: 38.783689, magnitude: 0.03 },
  { id: "altair", name: "Altair", raHours: 19.846389, declinationDegrees: 8.868322, magnitude: 0.76 },
  { id: "arcturus", name: "Arcturus", raHours: 14.26103, declinationDegrees: 19.182409, magnitude: -0.05 },
  { id: "capella", name: "Capella", raHours: 5.278155, declinationDegrees: 45.997991, magnitude: 0.08 },
  { id: "rigel", name: "Rigel", raHours: 5.242298, declinationDegrees: -8.20164, magnitude: 0.13 },
  { id: "betelgeuse", name: "Betelgeuse", raHours: 5.919529, declinationDegrees: 7.407064, magnitude: 0.42 },
  { id: "sirius", name: "Sirius", raHours: 6.752481, declinationDegrees: -16.716116, magnitude: -1.46 },
];

export const starsById = new Map(stars.map((star) => [star.id, star]));
