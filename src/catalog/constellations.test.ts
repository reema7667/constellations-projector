import { describe, expect, it } from "vitest";
import type { Constellation, Star } from "../types";
import { constellations, cygnus, resolveConstellation } from "./constellations";
import { stars } from "./stars";

function catalogueIssues(catalogue: readonly Constellation[], starCatalogue: readonly Star[]): string[] {
  const starIds = new Set(starCatalogue.map((star) => star.id));
  const issues: string[] = [];
  for (const constellation of catalogue) {
    for (const id of constellation.starIds) {
      if (!starIds.has(id)) issues.push(`${constellation.id}: unknown member ${id}`);
      const star = starCatalogue.find((candidate) => candidate.id === id);
      if (star && star.constellationId !== constellation.id) {
        issues.push(`${constellation.id}: member ${id} is tagged ${star.constellationId ?? "unassigned"}`);
      }
    }
    for (const [fromId, toId] of constellation.edges) {
      if (!constellation.starIds.includes(fromId)) issues.push(`${constellation.id}: edge starts outside members at ${fromId}`);
      if (!constellation.starIds.includes(toId)) issues.push(`${constellation.id}: edge ends outside members at ${toId}`);
    }
    if (!constellation.starIds.includes(constellation.labelStarId)) {
      issues.push(`${constellation.id}: label anchor is not a member ${constellation.labelStarId}`);
    }
  }
  const byConstellationId = new Map(catalogue.map((constellation) => [constellation.id, constellation]));
  for (const star of starCatalogue) {
    if (!star.constellationId) continue;
    const constellation = byConstellationId.get(star.constellationId);
    if (!constellation) issues.push(`${star.id}: unknown constellation tag ${star.constellationId}`);
    else if (!constellation.starIds.includes(star.id)) issues.push(`${star.id}: tagged ${star.constellationId} but absent from its members`);
  }
  return issues;
}

describe("constellation catalogue integrity", () => {
  it("keeps every Cygnus member, edge endpoint, and label anchor resolvable", () => {
    expect(constellations).toEqual([cygnus]);
    expect(catalogueIssues(constellations, stars)).toEqual([]);
  });

  it("reports unknown members and invalid drawing references", () => {
    const invalid: Constellation = {
      id: "invalid",
      name: "Invalid",
      starIds: ["missing"],
      edges: [["missing", "also-missing"]],
      labelStarId: "label-missing",
    };

    expect(catalogueIssues([invalid], stars)).toEqual([
      "invalid: unknown member missing",
      "invalid: edge ends outside members at also-missing",
      "invalid: label anchor is not a member label-missing",
      "deneb: unknown constellation tag cygnus",
      "sadr: unknown constellation tag cygnus",
      "albireo: unknown constellation tag cygnus",
      "delta-cygni: unknown constellation tag cygnus",
      "gienah: unknown constellation tag cygnus",
    ]);
  });

  it("reports mismatches in either direction between star tags and member lists", () => {
    const mismatchedStars: Star[] = [
      { id: "member", name: "Member", raHours: 0, declinationDegrees: 0, magnitude: 1 },
      { id: "tagged", name: "Tagged", raHours: 0, declinationDegrees: 0, magnitude: 1, constellationId: "test" },
    ];
    const mismatched: Constellation = {
      id: "test",
      name: "Test",
      starIds: ["member"],
      edges: [],
      labelStarId: "member",
    };

    expect(catalogueIssues([mismatched], mismatchedStars)).toEqual([
      "test: member member is tagged unassigned",
      "tagged: tagged test but absent from its members",
    ]);
  });
});

describe("constellation resolution", () => {
  it("resolves known IDs and degrades overview or stale IDs to no focus", () => {
    expect(resolveConstellation("cygnus")).toBe(cygnus);
    expect(resolveConstellation(null)).toBeNull();
    expect(resolveConstellation("stale-id")).toBeNull();
  });
});
