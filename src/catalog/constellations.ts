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

export const constellations: readonly Constellation[] = [cygnus];
