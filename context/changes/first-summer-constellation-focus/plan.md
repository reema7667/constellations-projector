# Plan: first-summer-constellation-focus

Source: `research.md`   Status: approved

Created: 2026-08-05   Updated: 2026-08-05

## Goal

The learner can select one drawn summer constellation, see its stars brighten while the surrounding sky dims, and watch the group move together through existing time playback with guide lines off by default.

## Current state

Cygnus is the only catalogue constellation and is passed directly from `main.ts` into the renderer on every frame. Its lines, labels, and focused colors are therefore always eligible, while `AppState` has no selection identity (`research.md`, Current state; `src/main.ts:23-24,83-94`; `src/types.ts:42-56`). Membership is duplicated between `Constellation.starIds` and `Star.constellationId`; the renderer uses the star field for styling but the constellation record for edges (`src/types.ts:1-16`; `src/rendering/skyRenderer.ts:58-85`). Lines currently default on, contrary to this slice (`src/state/appState.ts:5-13`).

Cygnus has been verified as a suitable June–September Riyadh target, and the current replay pipeline already demonstrates its motion without requiring time or calibration changes (`research.md`, Cygnus summer qualification and Contracts & constraints).

## Desired end state

The app opens to an unfocused sky overview with constellation lines off. The controls expose an overview/Cygnus choice; selecting Cygnus makes its five canonical members visually prominent, dims unrelated stars, and enables its optional lines and focused labels. Returning to overview removes focus. Selection remains session-only, and time playback continues to reproject the selected pattern without remounting the active time slider or changing replay/calibration semantics.

## Non-goals

- Adding any constellation beyond the existing Cygnus/Northern Cross data.
- Building the complete June–September catalogue, bilingual content, seasons, Arabic poetry, or cultural metadata.
- Adding gradual focus intensity; that belongs to `fade-to-unguided-recognition` (S-03).
- Persisting the selected constellation or display toggles across reloads.
- Changing star coordinates, magnitude sizing, horizon visibility, projection/calibration order, time ranges, playback rate, or playback boundaries.
- Introducing a new DOM/browser test dependency in this slice.

## Approach

Follow research option 2: introduce the minimum generic single-selection seam around Cygnus while keeping the existing Canvas, state-patch, controls, and animation patterns. Make `Constellation.starIds` the sole membership authority used for lines, styling, and labels; expose the current catalogue as the one-entry collection used immediately by the selector. Represent overview as `selectedConstellationId: null`; a dedicated selection action atomically selects Cygnus and enables contextual dimming, while choosing overview clears both. The user confirmed that the app must start unfocused and require an explicit Cygnus choice.

## Critical implementation details

- **Consistent membership representations:** preserve `Star.constellationId` for star-level catalogue lookup while rendering derives the active drawn shape from `Constellation.starIds`. Validate the relationship in both directions, plus every edge endpoint and label anchor, so the representations cannot silently drift.
- **Nullable focus is deliberate:** `renderSky` must accept `Constellation | null`. In overview it draws no constellation lines or focus-only labels and does not dim stars; with Cygnus selected it applies focused/member styling and only dims nonmembers. A stale/unknown selected ID must resolve safely to overview rather than crash.
- **Preserve physical/rendering invariants:** focus never changes RA/declination, horizontal coordinates, magnitude radius, below-horizon suppression, edge endpoint visibility, or the calibration-last pipeline.
- **Preserve time-control identity:** constellation selection is a discrete remount; slider input and playback retain the existing in-place `updateTimeControls` path.
- **Defaults:** `selectedConstellationId` is `null`, `showConstellationLines` is `false`, labels retain their current `true` default, and `dimContext` is `false` until Cygnus is selected.
- **Testable selection boundary:** catalogue ID lookup and the control's overview/Cygnus value mapping must be pure exported seams used by production wiring, so known, null, and stale IDs plus native control values are covered without pretending the Node test environment exercises a browser DOM.

## Phases

### Phase 1 — Establish a canonical nullable focus renderer

- Files: `src/types.ts`, `src/catalog/stars.ts`, `src/catalog/constellations.ts`, `src/catalog/constellations.test.ts`, `src/rendering/skyRenderer.ts`, `src/rendering/skyRenderer.test.ts`, `src/rendering/theme.ts`, `src/rendering/projection.test.ts`
- Change:
  - Export the one-entry readonly constellation catalogue while retaining the existing `cygnus` named export needed by current callers.
  - Render membership, focused star labels, and the constellation label from the active record's `Constellation.starIds`, while preserving each star's explicit `constellationId` catalogue tag.
  - Generalize the Cygnus-named focus color to a constellation-neutral focus token.
  - Allow `renderSky` to receive `null` and render a genuine overview: normal context stars, no dimming, no edges, and no focus-only labels. Preserve current selected-Cygnus behavior for the still-hard-coded caller so this phase remains green.
  - Add catalogue integrity tests for member IDs, bidirectional agreement with `Star.constellationId`, edge endpoints, and label anchors, plus renderer behavior tests proving overview versus selected focus, context dimming, default line gating, and below-horizon exclusion. Keep the existing projection/edge tests green.
- Verify (automated): `npm run test:run -- src/catalog/constellations.test.ts src/rendering/skyRenderer.test.ts src/rendering/projection.test.ts`; `npm run build`
- Verify (manual): none.
- Notes: use a minimal Canvas context double for recorded colors/lines; do not add a DOM library or change numerical projection code. The named `cygnus` export keeps the app runnable until Phase 2 replaces hard-coded focus.

### Phase 2 — Wire overview-first selection through state and controls

- Files: `src/types.ts`, `src/catalog/constellations.ts`, `src/catalog/constellations.test.ts`, `src/state/appState.ts`, `src/state/appState.test.ts`, `src/ui/controls.ts`, `src/ui/controls.test.ts`, `src/main.ts`, `src/style.css`, `README.md`
- Change:
  - Add session-only `selectedConstellationId: string | null` to `AppState`, initialized to `null`; switch `showConstellationLines` to `false` while preserving label and replay defaults. Add a small pure selection-transition helper in `appState.ts` that returns the atomic `{ selectedConstellationId, dimContext }` patch used by `main.ts`, so overview/focus transitions are testable without a DOM environment.
  - Add a dedicated constellation-selection action and a compact catalogue selector containing “Sky overview” plus the available Cygnus entry. Extract a pure control-model/value-mapping seam used by the DOM code; it supplies option values/labels, reflects the selected value, maps the overview value to `null`, and reports whether contextual dimming is available. The native selector remains keyboard/label accessible using existing control-panel conventions.
  - On selecting Cygnus, atomically set its ID and enable contextual dimming so the promised emphasis is immediately observable. On selecting overview, clear the ID and contextual dimming. Retain the existing “Dim unrelated stars” checkbox for selected-focus adjustment and explicitly disable it in overview using the native `disabled` state, so assistive technology and sighted users are not offered an ineffective control.
  - Add a pure catalogue resolver in `constellations.ts`, use it in `main.ts`, and pass either the matching constellation or `null` to `renderSky`. Its tests must cover the known Cygnus ID, `null`, and an unknown/stale ID degrading to overview.
  - Extend state tests for overview/line defaults and the pure selection transition. Extend control tests for overview-first option order, Cygnus option ID/label, selected-value reflection, empty-value-to-`null` event mapping, and overview dim-control unavailability. Keep existing time-control tests green; rely on build/type checking and the explicit manual browser gate only for native DOM interaction because the configured test environment is Node-only.
  - Update README usage/defaults to describe overview-first selection and lines-off behavior without changing the documented coordinate pipeline.
- Verify (automated): `npm run test:run -- src/catalog/constellations.test.ts src/state/appState.test.ts src/ui/controls.test.ts src/rendering/skyRenderer.test.ts`; `npm run test:run`; `npm run build`
- Verify (manual): in the target browser, confirm startup shows an unfocused, undimmed sky with no constellation lines; choosing Cygnus brightens its five members, dims unrelated stars, and preserves optional line/label toggles; returning to overview restores the undimmed sky. Then drag the time slider and play through time to confirm the same selected stars move together without slider interruption. — owner: user
- Notes: selection is a discrete control change, so the existing full control remount is acceptable. Do not persist it or alter `storage/settings.ts`.

## Success criteria

- [ ] On a fresh load, the projection is an unfocused overview: no selected constellation, no dimmed context, and guide lines off. (automated defaults + manual visual check)
- [ ] The controls present “Sky overview” and Cygnus, reflect the current selection, and support keyboard/browser-native selection. (build + manual interaction)
- [ ] Selecting Cygnus highlights exactly the IDs in `cygnus.starIds`, dims visible nonmembers, and makes optional visible-endpoint segments available without changing magnitude-based radius. (automated renderer tests + manual visual check)
- [ ] Returning to overview removes all focus-specific dimming, edges, and focus-only labels. (automated renderer/state tests + manual visual check)
- [ ] Catalogue integrity tests fail for an unknown member, edge endpoint, or label anchor. (automated)
- [ ] Time dragging/playback continues to move the selected pattern and update the existing slider in place; replay boundaries remain covered by the full suite. (automated regression suite + manual interaction)
- [ ] Existing calibration, fullscreen projection, settings persistence, coordinate convention, and below-horizon behavior remain green. (full suite/build + manual smoke check)
- [ ] Reloading resets to overview; no new focus value is written to calibration storage. (automated state baseline + manual reload)

## Risks & rollback

| Risk | Likelihood/impact | Mitigation / rollback in this plan |
|---|---|---|
| Star tags and constellation member lists drift apart | Medium / high | Preserve both useful representations but add bidirectional integrity tests that fail when a member is untagged/mistagged or a tagged star is absent from the matching member list. |
| Nullable focus causes renderer crashes or accidental focus artifacts | Medium / high | Make null an explicit tested render state; unknown IDs resolve to null in integration. Keep rendering and coordinate inputs immutable. |
| Selecting Cygnus does not visibly dim because state changes are split | Medium / high | Use one dedicated action that patches selection and dimming atomically; cover the transition in state/action tests and manual browser verification. |
| Selection remount regresses slider dragging/playback | Low / high | Remount only on the discrete selection event; retain continuous in-place updates and rerun the full time/control suite plus manual drag/playback. |
| Guide-line default change breaks expectations | Medium / low | Assert the new PRD-required default and preserve the opt-in toggle; rollback is a one-field default if product testing rejects it. |
| Canvas style behavior is hard to test in Node | Medium / medium | Use a narrow context recorder for renderer output and keep native selector interaction as an explicit human gate; do not introduce heavy browser tooling here. |
| Existing calibration or horizon math is accidentally altered | Low / high | Do not edit calibration/coordinate modules; run existing projection tests and full build/suite. Roll back the responsible phase if the regression appears. |

## Manual steps (human-gated)

- [ ] Verify overview → Cygnus → overview appearance in the target browser/projector, including dark-room legibility and lines-off startup. — owner: user
- [ ] With Cygnus selected, drag the time slider and run playback; confirm the five-star pattern moves together and the slider remains responsive. — owner: user
- [ ] Smoke-test calibration overlay, fullscreen/projection mode, `H` control hiding, and reload-to-overview behavior. — owner: user

## References

- `context/changes/first-summer-constellation-focus/research.md`
- `context/foundation/roadmap.md`, S-01
- `context/foundation/prd.md`, FR-003, FR-004, FR-005, FR-007 and NFR-004
- `context/changes/slider-playback-controls/research.md`
- `context/changes/time-replay-ranges/research.md`
- `context/changes/github-constellation-prior-art/research.md`
- `context/foundation/lessons.md` — read; no project lessons recorded yet

## Progress

| Phase | Status | Verified by |
|---|---|---|
| 1 — Canonical nullable focus renderer | done | `npm run test:run -- src/catalog/constellations.test.ts src/rendering/skyRenderer.test.ts src/rendering/projection.test.ts` (15/15); `npm run build` |
| 2 — Overview-first state and controls | todo | |

## Plan review amendments

- 2026-08-05 — Fresh plan review verdict: approve-with-changes. Added pure/tested control mapping and catalogue resolution seams; required known/null/unknown resolver coverage; chose native-disabled contextual dimming in overview and specified its model/interaction coverage. See `reviews/plan-review.md`.
- 2026-08-05 — Implementation amendment confirmed by the user: preserve `Star.constellationId` for explicit catalogue lookup and enforce bidirectional consistency with `Constellation.starIds`; rendering continues to derive the selected drawn shape from the active constellation record.
