import type { Constellation } from "../types";

export const cygnus: Constellation = {
  id: "cygnus",
  name: "Cygnus · Northern Cross",
  starIds: ["deneb", "sadr", "albireo", "delta-cygni", "gienah"],
  edges: [
    ["deneb", "sadr"],
    ["sadr", "albireo"],
    ["sadr", "delta-cygni"],
    ["sadr", "gienah"],
  ],
  labelStarId: "sadr",
};

export const scorpius: Constellation = {
  id: "scorpius",
  name: "Scorpius",
  starIds: ["pi-scorpii", "acrab", "dschubba", "antares", "tau-scorpii", "epsilon-scorpii", "mu1-scorpii", "zeta2-scorpii", "eta-scorpii", "sargas", "kappa-scorpii", "shaula", "lesath"],
  edges: [
    ["pi-scorpii", "dschubba"],
    ["acrab", "dschubba"],
    ["dschubba", "antares"],
    ["antares", "tau-scorpii"],
    ["tau-scorpii", "epsilon-scorpii"],
    ["epsilon-scorpii", "mu1-scorpii"],
    ["mu1-scorpii", "zeta2-scorpii"],
    ["zeta2-scorpii", "eta-scorpii"],
    ["eta-scorpii", "sargas"],
    ["sargas", "kappa-scorpii"],
    ["kappa-scorpii", "shaula"],
    ["shaula", "lesath"],
  ],
  labelStarId: "antares",
};

export const sagittarius: Constellation = {
  id: "sagittarius",
  name: "Sagittarius · Teapot",
  starIds: ["alnasl", "kaus-media", "kaus-borealis", "kaus-australis", "ascella", "tau-sagittarii", "nunki", "phi-sagittarii"],
  edges: [
    ["kaus-media", "alnasl"],
    ["kaus-media", "kaus-borealis"],
    ["kaus-borealis", "phi-sagittarii"],
    ["phi-sagittarii", "nunki"],
    ["nunki", "tau-sagittarii"],
    ["tau-sagittarii", "ascella"],
    ["ascella", "kaus-australis"],
    ["kaus-australis", "kaus-media"],
  ],
  labelStarId: "kaus-australis",
};

export const constellations: readonly Constellation[] = [cygnus, scorpius, sagittarius];

export function resolveConstellation(id: string | null): Constellation | null {
  if (id === null) return null;
  return constellations.find((constellation) => constellation.id === id) ?? null;
}
