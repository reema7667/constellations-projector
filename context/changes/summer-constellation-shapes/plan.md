# Plan: summer-constellation-shapes

Source: `research.md`   Status: approved

Created: 2026-08-05   Updated: 2026-08-05

## Goal

The learner can browse the complete June–September learning group and focus any of its drawn constellation patterns in the projector.

## Current state

S-01 already provides catalogue-driven selection and generic nullable-focus rendering: the selector is built from `constellations`, rendering uses the selected record's `starIds`, stale IDs fall back to overview, and selection atomically enables contextual dimming (`research.md`, Current state; `src/catalog/constellations.ts:3-20`; `src/ui/controls.ts:24-38,75-91`; `src/main.ts:67-68,93-95`). The catalogue still contains only Cygnus. Vega and Altair exist as untagged context stars, while Lyra, Aquila, Scorpius, and Sagittarius have no records or learning shapes (`src/catalog/stars.ts:8-21`).

The existing integrity test already enforces bidirectional agreement between `Constellation.starIds` and `Star.constellationId`, plus valid edge and label references, but its top-level expected catalogue and selector option assertions are still Cygnus-only (`src/catalog/constellations.test.ts:6-39`; `src/ui/controls.test.ts:37-47`).

## Desired end state

The native selector lists Sky overview followed by Cygnus, Lyra, Aquila, Scorpius, and Sagittarius in a stable learning order. Any entry can be focused through the existing interaction: its curated bright-star silhouette is highlighted, unrelated stars dim, guide lines remain off until requested, and time playback moves the same selected members together. The expanded catalogue is bundled offline, every astronomical record and shape decision has nearby provenance, and automated checks establish catalogue integrity plus a usable post-darkness/pre-midnight Riyadh window for every selected pattern across June–September.

## Non-goals

- Adding Delphinus, Sagitta, Vulpecula, Hercules, Ophiuchus, every technically visible summer constellation, or all 88 IAU constellations.
- Treating curated stick figures as official IAU lines or treating the Summer Triangle and Teapot asterisms as IAU constellations.
- Adding season prose, best-month cards, Arabic/English switching, poetry, traditional lore, or cultural mappings; those remain S-04 through S-06.
- Adding search, catalogue cards, quizzes, scores, audio, focus fading, or persistence of the selected constellation.
- Importing the disputed-license `ConstellationLines` sequences or any Stellarium/d3-celestial data bundle.
- Changing calibration, projection math, horizon suppression, magnitude sizing, playback semantics, fullscreen behavior, or the lines-off default.

## Approach

Follow research option 2: extend the existing static catalogue with the five-pattern learning group—Cygnus, Lyra, Aquila, Scorpius, and Sagittarius—without changing the selection/rendering architecture. Author small bright-star teaching silhouettes locally from individually sourced astronomical records, document that they are non-official learning shapes, and retain the existing bidirectional membership invariant. Add the southern pair first because their low-altitude edge cases are the riskiest, then complete the Summer Triangle pair and verify the assembled catalogue end to end.

## Critical implementation details

- **Teaching shape is not boundary membership:** `Constellation.starIds` means only stars deliberately selected for the recognizable silhouette. It must not expand to every star located within the IAU constellation boundary. `Star.constellationId` remains the star-level tag, and tests keep both representations consistent.
- **Stable identities and order:** use one record per physical star and stable lowercase IDs. Vega belongs to Lyra, Altair to Aquila, and Deneb remains in Cygnus even though all three participate in the cross-constellation Summer Triangle asterism. Final selector order is `cygnus`, `lyra`, `aquila`, `scorpius`, `sagittarius`.
- **Minimal recognizable silhouettes:** use a small bright-star subset, not the full borrowed line catalog. The planning baseline is Lyra with Vega, ζ¹, δ², Sulafat, and Sheliak; Aquila with Tarazed, Altair, Alshain, δ, ζ, ε, and λ Aquilae; Scorpius with π, Acrab, Dschubba, Antares, τ, ε, μ¹, ζ², η, Sargas, κ, Shaula, and Lesath; and Sagittarius with Alnasl, Kaus Media, Kaus Borealis, Kaus Australis, Ascella, τ, Nunki, and φ Sagittarii. Exact edges are locally authored to express those named silhouettes and recorded in the attribution note as pedagogical choices. A member may be removed only if the automated visibility audit or projector review rejects it; that is accepted simplification, not permission to substitute a different line catalogue silently.
- **Astronomical provenance stays adjacent:** source J2000 coordinates, V magnitudes, identifiers, and official proper-name spellings from IAU WGSN plus individually checked SIMBAD/VizieR records. Add `src/catalog/ATTRIBUTION.md` with source URLs/catalogue references, access date, acknowledgement/license notes, and a per-pattern member/shape rationale. Do not claim SIMBAD itself is a homogeneous catalogue.
- **Visibility is a catalogue acceptance test:** for representative mid-month dates in June, July, August, and September, scan the interval from astronomical dusk to local midnight at no coarser than 15-minute steps and require at least one sampled instant when every learning-shape member is at or above 10°. Construct the reference date and midnight with explicit `+03:00` Arabia Standard Time offsets and use Astronomy Engine for dusk/altitudes; never let the test inherit the machine/CI timezone. Use the existing Riyadh observer and astronomy path; do not encode these results as user-facing season copy in S-02.
- **Preserve generic seams:** no production change is expected in `types.ts`, `ui/controls.ts`, `main.ts`, `state/appState.ts`, or `rendering/skyRenderer.ts`. If implementation discovers one is necessary, stop and amend the plan rather than silently widening the slice.

## Phases

### Phase 1 — Add and qualify the southern summer silhouettes

- Files: `src/catalog/stars.ts`, `src/catalog/constellations.ts`, `src/catalog/constellations.test.ts`, `src/catalog/ATTRIBUTION.md`, `src/ui/controls.test.ts`
- Change:
  - Add minimal, individually sourced bright-star records for Scorpius and Sagittarius, with unique IDs and matching `constellationId` tags. Define Scorpius as a recognizable head/body/curved-tail/stinger teaching shape anchored by Antares, and Sagittarius as the Teapot teaching shape anchored by Kaus Australis.
  - Append both records without changing Cygnus. Keep the final intended group order even while Lyra/Aquila are not yet present: Cygnus, Scorpius, Sagittarius for this phase.
  - Create the adjacent attribution note and record IAU identity sources, astronomical record sources/access dates, CDS acknowledgement/license information, and the fact that edges are locally curated non-official teaching shapes.
  - Generalize the catalogue expectation so it validates the current collection rather than asserting `[cygnus]`. From this first expansion onward, reject duplicate star IDs, duplicate constellation IDs, non-finite coordinates/magnitudes, RA outside `[0,24)`, and declination outside `[-90,90]`. Preserve and exercise bidirectional membership, unknown member/tag, edge endpoint, and label-anchor failures; make negative integrity tests use small self-contained star/constellation fixtures so adding valid production stars does not inflate unrelated expected-error lists.
  - Add a visibility audit over every current constellation member for June–September, reporting the constellation/month when no ≥10° shared window exists. Use explicit AST reference/midnight instants, Astronomy Engine astronomical dusk, and a sampling interval no coarser than 15 minutes so the result is deterministic outside Riyadh-hosted test machines.
  - Update control-model coverage for the interim catalogue order and prove both southern IDs reflect as selectable focused values while overview/stale behavior remains unchanged.
- Verify (automated): `npm run test:run -- src/catalog/constellations.test.ts src/ui/controls.test.ts src/rendering/skyRenderer.test.ts src/astronomy/coordinates.test.ts`; `npm run test:run`; `npm run build`
- Verify (manual): in the target browser/projector, select Scorpius and Sagittarius in turn; with lines briefly enabled, confirm each silhouette is recognizable and not clipped during at least one useful point in the 24-hour replay, then turn lines off and confirm focus/dimming remains clear. — owner: user
- Notes: the visibility test is a load-bearing guard; deliberately alter one fixture/member to a below-window coordinate and observe the audit fail before accepting the implementation. If the curated member set cannot satisfy the threshold, simplify the silhouette or amend the research rule—do not weaken the test silently.

### Phase 2 — Complete the Summer Triangle catalogue and assembled learning flow

- Files: `src/catalog/stars.ts`, `src/catalog/constellations.ts`, `src/catalog/constellations.test.ts`, `src/catalog/ATTRIBUTION.md`, `src/ui/controls.test.ts`, `src/rendering/skyRenderer.test.ts`, `README.md`
- Change:
  - Tag the existing Vega record as Lyra and Altair record as Aquila. Add only the additional sourced stars needed for Lyra's Vega-plus-parallelogram silhouette and Aquila's Altair-centered spine/wing/tail silhouette; do not duplicate Deneb, Vega, or Altair to represent the Summer Triangle.
  - Insert Lyra and Aquila into the stable final learning order: Cygnus, Lyra, Aquila, Scorpius, Sagittarius. Complete the attribution note with their per-star sources and locally authored shape rationale.
  - Update catalogue tests to assert the exact five IDs/order and exact absence of duplicate star IDs, then run the integrity and four-month visibility audit across the entire final group. Keep resolver coverage for every known ID plus null/stale fallback.
  - Update the selector model expectation to Sky overview plus all five entries, and exercise each ID as selectable. Extend the renderer test with at least one non-Cygnus record so member highlighting, nonmember dimming, focus labels, line gating, and visible-endpoint behavior demonstrably remain catalogue-generic.
  - Update README language from a Cygnus-only projector to the five-pattern June–September learning group. Distinguish IAU constellation identities from curated learning shapes, name the astronomical/provenance sources, retain lines-off/overview-first instructions, and keep runtime use fully offline.
- Verify (automated): `npm run test:run -- src/catalog/constellations.test.ts src/ui/controls.test.ts src/rendering/skyRenderer.test.ts src/astronomy/coordinates.test.ts`; `npm run test:run`; `npm run build`
- Verify (manual): in the target browser/projector, confirm selector order and overview → each of five patterns → overview. For Lyra and Aquila, briefly enable lines to judge recognizable shape and dark-room legibility, then disable lines and confirm the selected stars remain perceptually grouped. Drag and play time for each new selection; confirm the selected pattern moves together and the slider remains responsive. — owner: user
- Notes: selection changes may remount controls, but continuous time updates must retain the existing in-place slider path. No runtime source/data fetch is allowed.

## Success criteria

- [ ] The selector presents exactly Sky overview, Cygnus, Lyra, Aquila, Scorpius, and Sagittarius in that order; every known ID focuses and stale IDs still show overview. (automated control/resolver tests + manual browser check)
- [ ] Each of the five constellation records has a unique ID, a nonempty minimal teaching shape, resolvable member IDs, valid edge endpoints/label anchor, and bidirectional agreement with `Star.constellationId`. (automated catalogue tests)
- [ ] Vega is tagged only to Lyra, Altair only to Aquila, and Deneb only to Cygnus; the Summer Triangle does not duplicate stars or become a false IAU constellation record. (automated catalogue tests)
- [ ] Scorpius reads as head/body/curved tail/stinger, Sagittarius as the Teapot, Lyra as Vega plus parallelogram, and Aquila as an Altair-centered eagle-like outline when optional lines are shown. (user projector sign-off)
- [ ] With lines off, focusing any catalogue entry highlights exactly its teaching-shape members and dims visible nonmembers without changing magnitude-derived radius or showing below-horizon members. (automated renderer tests + user visual check)
- [ ] Every selected pattern has at least one shared interval sample with all members ≥10° between Riyadh astronomical dusk and local midnight on representative June, July, August, and September dates. (automated visibility audit)
- [ ] Each new astronomical record and each locally curated shape has adjacent source/access/attribution documentation; no disputed-license third-party line sequence is imported. (review of `src/catalog/ATTRIBUTION.md` and diff)
- [ ] Time dragging/playback, calibration persistence, fullscreen/projection mode, `H`, overview reload, and lines-off defaults remain intact. (full suite/build + manual projector smoke check)
- [ ] The production bundle contains the complete five-pattern catalogue without runtime network access. (build/static inspection + offline manual check)

## Risks & rollback

| Risk | Likelihood/impact | Mitigation / rollback in this plan |
|---|---|---|
| A selected shape includes a star too low to share a useful Riyadh window | Medium / high | Put the four-month all-member visibility audit in Phase 1 and retain it for the final group; simplify the teaching shape before shipping. Roll back the affected catalogue record, not astronomy math. |
| Locally curated edges are scientifically presented as official | Medium / high | State the IAU boundary/figure distinction in attribution and README; call them teaching shapes; review the rendered silhouettes manually. |
| Star/member duplication or mistagging corrupts focus | Medium / high | Preserve bidirectional membership checks, add unique-ID/group-order assertions, and explicitly test Summer Triangle anchors remain single records. |
| More background stars make focused patterns harder to perceive | Medium / medium | Keep the added catalogue minimal, preserve existing dimming, and require lines-off dark-room projector review in both phases. Roll back marginal nonessential members first. |
| A third-party line/data license silently contaminates the catalogue | Low / high | Do not import disputed line sequences; record individually consulted sources and locally authored edges in `ATTRIBUTION.md`; review the diff for copied bulk data. |
| Tests become coupled to one constellation and miss generic regressions | Medium / medium | Exercise a southern record in Phase 1 controls and a non-Cygnus record in Phase 2 renderer tests; retain null/stale paths. |
| Catalogue expansion regresses time, calibration, or fullscreen behavior | Low / high | Avoid their production modules, run the full suite/build each phase, and repeat projector smoke checks. Roll back the responsible catalogue phase if regression appears. |
| Five entries make the compact control unusable | Low / medium | Retain the native select, stable learning order, and dark-room manual check; defer search/cards until evidence requires them. |

## Manual steps (human-gated)

- [x] Review Scorpius and Sagittarius on the target projector with lines briefly on and then off; confirm recognizable silhouettes, useful framing, and dark-room legibility. — owner: user (confirmed 2026-08-05)
- [ ] Review Lyra and Aquila on the target projector with lines briefly on and then off; confirm recognizable silhouettes and clear selected/context separation. — owner: user
- [ ] Browse overview and all five entries, then drag/play time; smoke-test calibration, fullscreen/projection, `H`, reload-to-overview, lines-off default, and operation with network disabled. — owner: user

## References

- `context/changes/summer-constellation-shapes/research.md`
- `context/foundation/roadmap.md`, S-02
- `context/foundation/prd.md`, FR-001, FR-005, FR-007; NFR-001, NFR-002, NFR-004
- `context/archive/2026-08-05-first-summer-constellation-focus/research.md`
- `context/archive/2026-08-05-first-summer-constellation-focus/plan.md`
- `context/changes/github-constellation-prior-art/research.md`
- `context/foundation/lessons.md` — read; no project lessons recorded yet

## Progress

| Phase | Status | Verified by |
|---|---|---|
| 1 — Southern summer silhouettes | done | focused suite (15 tests), full suite (32 tests), production build; user projector sign-off 2026-08-05 |
| 2 — Summer Triangle and assembled catalogue | automated done; manual pending | focused suite (17 tests), full suite (34 tests), production build; projector/browser review pending |

## Plan review amendments

- 2026-08-05 — Fresh plan review verdict: approve-with-changes. Made the visibility audit deterministic across host timezones with explicit AST instants and a ≤15-minute sampling interval; moved duplicate/numeric catalogue validation into Phase 1; isolated negative integrity fixtures from the growing production catalogue. See `reviews/plan-review.md`.

## Follow-ups

- Compare the current five-star Lyra (Vega plus the four-star parallelogram) with a six-star teaching variant that adds Epsilon Lyrae. Keep the five-star shape unless a later projector/content review demonstrates that the sixth star materially improves unaided recognition.
