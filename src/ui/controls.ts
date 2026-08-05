import type { AppState, Calibration, Constellation } from "../types";
import type { ReplayRange } from "../types";
import { replayDurationHours } from "../astronomy/time";
import { createCalibrationPanel } from "./calibrationPanel";

export interface ControlActions {
  onResetTime(): void; onOffset(hours: number): void; onTogglePlay(): void;
  onReplayRange(range: ReplayRange): void;
  onConstellation(id: string | null): void;
  onPatch(patch: Partial<AppState>): void; onCalibration(value: Calibration): void;
  onProjection(): void;
}

export interface ConstellationControlModel {
  selectedValue: string;
  options: readonly { value: string; label: string }[];
  dimContextDisabled: boolean;
}

export function constellationIdFromControlValue(value: string): string | null {
  return value === "" ? null : value;
}

export function constellationControlModel(
  state: Pick<AppState, "selectedConstellationId">,
  catalogue: readonly Constellation[],
): ConstellationControlModel {
  const selectedConstellation = catalogue.find(
    (constellation) => constellation.id === state.selectedConstellationId,
  );
  return {
    selectedValue: selectedConstellation?.id ?? "",
    options: [
      { value: "", label: "Sky overview" },
      ...catalogue.map((constellation) => ({ value: constellation.id, label: constellation.name })),
    ],
    dimContextDisabled: selectedConstellation === undefined,
  };
}

export function formatDisplayedTime(date: Date): string {
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function updateTimeControls(root: ParentNode, state: Pick<AppState, "now" | "offsetHours" | "anchorTime" | "replayEnd">): void {
  const display = root.querySelector<HTMLTimeElement>("[data-time-display]");
  const slider = root.querySelector<HTMLInputElement>("[data-time-slider]");
  if (display) display.textContent = formatDisplayedTime(state.now);
  if (slider) {
    slider.max = String(replayDurationHours({ start: state.anchorTime, end: state.replayEnd }));
    slider.value = String(state.offsetHours);
  }
}

export function createControls(state: AppState, catalogue: readonly Constellation[], actions: ControlActions): HTMLElement {
  const shell = document.createElement("aside"); shell.id = "controls";
  shell.className = state.controlsVisible ? "" : "hidden";
  const title = document.createElement("header");
  title.innerHTML = `<div><p class="eyebrow">RIYADH · LIVE SKY</p><h1>Ceiling Sky</h1></div>`;
  shell.append(title);
  const time = document.createElement("section"); time.className = "time-panel";
  const rangeChoices = document.createElement("div"); rangeChoices.className = "replay-ranges";
  rangeChoices.setAttribute("aria-label", "Replay range");
  rangeChoices.append(
    rangeButton("Dusk to dawn", "night", state.replayRange, actions.onReplayRange),
    rangeButton("24 hours", "day", state.replayRange, actions.onReplayRange),
  );
  const display = document.createElement("time"); display.dataset.timeDisplay = ""; display.textContent = formatDisplayedTime(state.now);
  const slider = document.createElement("input"); slider.type = "range"; slider.min = "0"; slider.max = String(replayDurationHours({ start: state.anchorTime, end: state.replayEnd })); slider.step = "0.05"; slider.value = String(state.offsetHours);
  slider.dataset.timeSlider = "";
  slider.setAttribute("aria-label", "Time offset in hours"); slider.addEventListener("input", () => actions.onOffset(Number(slider.value)));
  const buttons = document.createElement("div"); buttons.className = "button-row";
  const restart = button("Restart", actions.onResetTime); const play = button(state.playing ? "Pause" : "Play", actions.onTogglePlay);
  buttons.append(restart, play); time.append(rangeChoices, display, slider, buttons); shell.append(time);
  const focusModel = constellationControlModel(state, catalogue);
  const focus = document.createElement("section"); focus.className = "focus-panel";
  const focusLabel = document.createElement("label"); focusLabel.className = "focus-row";
  const focusText = document.createElement("span"); focusText.textContent = "Constellation";
  const focusSelect = document.createElement("select"); focusSelect.setAttribute("aria-label", "Focused constellation");
  for (const choice of focusModel.options) {
    const option = document.createElement("option"); option.value = choice.value; option.textContent = choice.label;
    focusSelect.append(option);
  }
  focusSelect.value = focusModel.selectedValue;
  focusSelect.addEventListener("change", () => actions.onConstellation(constellationIdFromControlValue(focusSelect.value)));
  focusLabel.append(focusText, focusSelect); focus.append(focusLabel); shell.append(focus);
  const toggles = document.createElement("section"); toggles.className = "toggle-panel";
  toggles.append(
    checkbox("Constellation lines", state.showConstellationLines, (checked) => actions.onPatch({ showConstellationLines: checked })),
    checkbox("Star labels", state.showLabels, (checked) => actions.onPatch({ showLabels: checked })),
    checkbox("Dim unrelated stars", state.dimContext, (checked) => actions.onPatch({ dimContext: checked }), focusModel.dimContextDisabled),
    checkbox("Calibration overlay", state.calibrationMode, (checked) => actions.onPatch({ calibrationMode: checked })),
  );
  toggles.append(button("Enter projection", actions.onProjection)); shell.append(toggles);
  if (state.calibrationMode) shell.append(createCalibrationPanel(state.calibration, actions.onCalibration));
  const footer = document.createElement("footer"); footer.textContent = "H hides controls · Esc exits fullscreen"; shell.append(footer);
  return shell;
}

function button(label: string, action: () => void): HTMLButtonElement {
  const element = document.createElement("button"); element.type = "button"; element.textContent = label; element.addEventListener("click", action); return element;
}

function rangeButton(label: string, range: ReplayRange, selected: ReplayRange, action: (range: ReplayRange) => void): HTMLButtonElement {
  const element = button(label, () => action(range));
  const active = range === selected;
  element.className = active ? "active" : "";
  element.setAttribute("aria-pressed", String(active));
  return element;
}

function checkbox(label: string, checked: boolean, action: (checked: boolean) => void, disabled = false): HTMLLabelElement {
  const row = document.createElement("label"); row.className = "check-row";
  if (disabled) row.classList.add("disabled");
  const input = document.createElement("input"); input.type = "checkbox"; input.checked = checked; input.disabled = disabled; input.addEventListener("change", () => action(input.checked));
  row.append(input, document.createTextNode(label)); return row;
}
