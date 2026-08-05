import type { Star } from "../types";

/**
 * ICRS/J2000 coordinates and V magnitudes, transcribed from SIMBAD.
 * Values remain in their conventional astronomical coordinate system.
 * Accessed for this catalog: 2025-02-24 and 2026-08-05.
 */
export const stars: readonly Star[] = [
  { id: "deneb", name: "Deneb", raHours: 20.690531, declinationDegrees: 45.280338, magnitude: 1.25, constellationId: "cygnus" },
  { id: "sadr", name: "Sadr", raHours: 20.370473, declinationDegrees: 40.256679, magnitude: 2.23, constellationId: "cygnus" },
  { id: "albireo", name: "Albireo", raHours: 19.512023, declinationDegrees: 27.959681, magnitude: 3.05, constellationId: "cygnus" },
  { id: "delta-cygni", name: "Delta Cygni", raHours: 19.749574, declinationDegrees: 45.13081, magnitude: 2.87, constellationId: "cygnus" },
  { id: "gienah", name: "Gienah", raHours: 20.770178, declinationDegrees: 33.970257, magnitude: 2.46, constellationId: "cygnus" },
  { id: "pi-scorpii", name: "Pi Scorpii", raHours: 15.980865, declinationDegrees: -26.114108, magnitude: 2.91, constellationId: "scorpius" },
  { id: "acrab", name: "Acrab", raHours: 16.090619, declinationDegrees: -19.805453, magnitude: 2.56, constellationId: "scorpius" },
  { id: "dschubba", name: "Dschubba", raHours: 16.005557, declinationDegrees: -22.62171, magnitude: 2.32, constellationId: "scorpius" },
  { id: "antares", name: "Antares", raHours: 16.490129, declinationDegrees: -26.431946, magnitude: 0.96, constellationId: "scorpius" },
  { id: "tau-scorpii", name: "Tau Scorpii", raHours: 16.598044, declinationDegrees: -28.216017, magnitude: 2.82, constellationId: "scorpius" },
  { id: "epsilon-scorpii", name: "Epsilon Scorpii", raHours: 16.83606, declinationDegrees: -34.293232, magnitude: 2.29, constellationId: "scorpius" },
  { id: "mu1-scorpii", name: "Mu1 Scorpii", raHours: 16.864509, declinationDegrees: -38.04738, magnitude: 3, constellationId: "scorpius" },
  { id: "zeta2-scorpii", name: "Zeta2 Scorpii", raHours: 16.90973, declinationDegrees: -42.361316, magnitude: 3.62, constellationId: "scorpius" },
  { id: "eta-scorpii", name: "Eta Scorpii", raHours: 17.202548, declinationDegrees: -43.239189, magnitude: 3.33, constellationId: "scorpius" },
  { id: "sargas", name: "Sargas", raHours: 17.62198, declinationDegrees: -42.997824, magnitude: 1.87, constellationId: "scorpius" },
  { id: "kappa-scorpii", name: "Kappa Scorpii", raHours: 17.708133, declinationDegrees: -39.029983, magnitude: 2.41, constellationId: "scorpius" },
  { id: "shaula", name: "Shaula", raHours: 17.560145, declinationDegrees: -37.103821, magnitude: 1.62, constellationId: "scorpius" },
  { id: "lesath", name: "Lesath", raHours: 17.512733, declinationDegrees: -37.295811, magnitude: 2.7, constellationId: "scorpius" },
  { id: "alnasl", name: "Alnasl", raHours: 18.096803, declinationDegrees: -30.424091, magnitude: 2.98, constellationId: "sagittarius" },
  { id: "kaus-media", name: "Kaus Media", raHours: 18.3499, declinationDegrees: -29.828104, magnitude: 2.7, constellationId: "sagittarius" },
  { id: "kaus-borealis", name: "Kaus Borealis", raHours: 18.466179, declinationDegrees: -25.4217, magnitude: 2.81, constellationId: "sagittarius" },
  { id: "kaus-australis", name: "Kaus Australis", raHours: 18.402868, declinationDegrees: -34.384616, magnitude: 1.85, constellationId: "sagittarius" },
  { id: "ascella", name: "Ascella", raHours: 19.043532, declinationDegrees: -29.880105, magnitude: 2.6, constellationId: "sagittarius" },
  { id: "tau-sagittarii", name: "Tau Sagittarii", raHours: 19.11567, declinationDegrees: -27.670423, magnitude: 3.32, constellationId: "sagittarius" },
  { id: "nunki", name: "Nunki", raHours: 18.92109, declinationDegrees: -26.296722, magnitude: 2.05, constellationId: "sagittarius" },
  { id: "phi-sagittarii", name: "Phi Sagittarii", raHours: 18.76094, declinationDegrees: -26.990779, magnitude: 3.17, constellationId: "sagittarius" },
  { id: "vega", name: "Vega", raHours: 18.615649, declinationDegrees: 38.783689, magnitude: 0.03 },
  { id: "altair", name: "Altair", raHours: 19.846389, declinationDegrees: 8.868322, magnitude: 0.76 },
  { id: "arcturus", name: "Arcturus", raHours: 14.26103, declinationDegrees: 19.182409, magnitude: -0.05 },
  { id: "capella", name: "Capella", raHours: 5.278155, declinationDegrees: 45.997991, magnitude: 0.08 },
  { id: "rigel", name: "Rigel", raHours: 5.242298, declinationDegrees: -8.20164, magnitude: 0.13 },
  { id: "betelgeuse", name: "Betelgeuse", raHours: 5.919529, declinationDegrees: 7.407064, magnitude: 0.42 },
  { id: "sirius", name: "Sirius", raHours: 6.752481, declinationDegrees: -16.716116, magnitude: -1.46 },
];

export const starsById = new Map(stars.map((star) => [star.id, star]));
