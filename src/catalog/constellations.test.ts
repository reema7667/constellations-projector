import { Body, SearchAltitude } from "astronomy-engine";
import { describe, expect, it } from "vitest";
import { starToHorizontal } from "../astronomy/coordinates";
import { astronomyObserver } from "../astronomy/observer";
import type { Constellation, Star } from "../types";
import { aquila, constellations, cygnus, lyra, resolveConstellation, sagittarius, scorpius } from "./constellations";
import { stars } from "./stars";

function duplicates(values: readonly string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function catalogueIssues(catalogue: readonly Constellation[], starCatalogue: readonly Star[]): string[] {
  const starIds = new Set(starCatalogue.map((star) => star.id));
  const issues = duplicates(starCatalogue.map((star) => star.id)).map((id) => `duplicate star ID ${id}`);
  issues.push(...duplicates(catalogue.map((constellation) => constellation.id)).map((id) => `duplicate constellation ID ${id}`));

  for (const star of starCatalogue) {
    if (![star.raHours, star.declinationDegrees, star.magnitude].every(Number.isFinite)) {
      issues.push(`${star.id}: non-finite astronomical value`);
    }
    if (star.raHours < 0 || star.raHours >= 24) issues.push(`${star.id}: RA outside [0,24)`);
    if (star.declinationDegrees < -90 || star.declinationDegrees > 90) issues.push(`${star.id}: declination outside [-90,90]`);
  }

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

function visibilityIssues(catalogue: readonly Constellation[], starCatalogue: readonly Star[]): string[] {
  const byId = new Map(starCatalogue.map((star) => [star.id, star]));
  const issues: string[] = [];

  for (const month of [6, 7, 8, 9]) {
    const monthText = String(month).padStart(2, "0");
    const afternoon = new Date(`2026-${monthText}-15T12:00:00+03:00`);
    const midnight = new Date(`2026-${monthText}-16T00:00:00+03:00`);
    const dusk = SearchAltitude(Body.Sun, astronomyObserver(), -1, afternoon, 1, -18);
    if (!dusk) throw new Error(`No astronomical dusk found for ${monthText}`);

    for (const constellation of catalogue) {
      const members = constellation.starIds.map((id) => byId.get(id)).filter((star): star is Star => Boolean(star));
      let hasSharedWindow = false;
      for (let time = dusk.date.getTime(); time <= midnight.getTime(); time += 15 * 60 * 1000) {
        const date = new Date(time);
        if (members.length === constellation.starIds.length && members.every((star) => starToHorizontal(star, date).altitudeDegrees >= 10)) {
          hasSharedWindow = true;
          break;
        }
      }
      if (!hasSharedWindow) issues.push(`${constellation.id}: no shared >=10° window in ${monthText}`);
    }
  }
  return issues;
}

describe("constellation catalogue integrity", () => {
  it("keeps the final learning order and all production references valid", () => {
    expect(constellations).toEqual([cygnus, lyra, aquila, scorpius, sagittarius]);
    expect(new Set(stars.map((star) => star.id)).size).toBe(stars.length);
    expect(catalogueIssues(constellations, stars)).toEqual([]);
  });

  it("keeps each Summer Triangle anchor as one physical star in its IAU constellation", () => {
    expect(stars.filter((star) => star.id === "deneb")).toHaveLength(1);
    expect(stars.filter((star) => star.id === "vega")).toHaveLength(1);
    expect(stars.filter((star) => star.id === "altair")).toHaveLength(1);
    expect(stars.find((star) => star.id === "deneb")?.constellationId).toBe("cygnus");
    expect(stars.find((star) => star.id === "vega")?.constellationId).toBe("lyra");
    expect(stars.find((star) => star.id === "altair")?.constellationId).toBe("aquila");
    expect(constellations.some((constellation) => constellation.id === "summer-triangle")).toBe(false);
  });

  it("reports malformed values, duplicate IDs, and invalid drawing references", () => {
    const fixtureStars: Star[] = [
      { id: "member", name: "Member", raHours: 24, declinationDegrees: -91, magnitude: Number.NaN, constellationId: "test" },
      { id: "member", name: "Duplicate", raHours: 0, declinationDegrees: 0, magnitude: 1 },
    ];
    const fixture: Constellation = {
      id: "test", name: "Test", starIds: ["member", "missing"],
      edges: [["member", "outside"]], labelStarId: "outside",
    };
    const duplicateFixture = { ...fixture };

    expect(catalogueIssues([fixture, duplicateFixture], fixtureStars)).toEqual(expect.arrayContaining([
      "duplicate star ID member",
      "duplicate constellation ID test",
      "member: non-finite astronomical value",
      "member: RA outside [0,24)",
      "member: declination outside [-90,90]",
      "test: unknown member missing",
      "test: edge ends outside members at outside",
      "test: label anchor is not a member outside",
    ]));
  });

  it("reports mismatches in either direction using self-contained fixtures", () => {
    const fixtureStars: Star[] = [
      { id: "member", name: "Member", raHours: 0, declinationDegrees: 0, magnitude: 1 },
      { id: "tagged", name: "Tagged", raHours: 0, declinationDegrees: 0, magnitude: 1, constellationId: "test" },
    ];
    const fixture: Constellation = { id: "test", name: "Test", starIds: ["member"], edges: [], labelStarId: "member" };
    expect(catalogueIssues([fixture], fixtureStars)).toEqual([
      "test: member member is tagged unassigned",
      "tagged: tagged test but absent from its members",
    ]);
  });

  it("finds a shared Riyadh post-dusk window for every pattern from June through September", () => {
    expect(visibilityIssues(constellations, stars)).toEqual([]);
  });

  it("rejects a member deliberately moved below the useful window", () => {
    const impossibleStars = stars.map((star) => star.id === "antares" ? { ...star, declinationDegrees: -90 } : star);
    expect(visibilityIssues([scorpius], impossibleStars)).toEqual([
      "scorpius: no shared >=10° window in 06",
      "scorpius: no shared >=10° window in 07",
      "scorpius: no shared >=10° window in 08",
      "scorpius: no shared >=10° window in 09",
    ]);
  });
});

describe("constellation resolution", () => {
  it("resolves every known ID and degrades overview or stale IDs to no focus", () => {
    for (const constellation of constellations) expect(resolveConstellation(constellation.id)).toBe(constellation);
    expect(resolveConstellation(null)).toBeNull();
    expect(resolveConstellation("stale-id")).toBeNull();
  });
});
