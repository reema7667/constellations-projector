import { IDENTITY_CALIBRATION } from "../rendering/calibration";
import type { Calibration } from "../types";

type ChangeHandler = (value: Calibration) => void;

export function createCalibrationPanel(initial: Calibration, onChange: ChangeHandler): HTMLElement {
  const panel = document.createElement("section"); panel.className = "calibration-panel";
  panel.innerHTML = `<h2>Projector calibration</h2><p class="hint">Align the horizon and compass with the room.</p>`;
  let value = { ...initial };
  const ranges: [keyof Calibration, string, number, number, number][] = [
    ["rotationDegrees", "Rotation", -180, 180, 1], ["scale", "Scale", 0.5, 1.5, 0.01],
    ["offsetX", "X offset", -0.5, 0.5, 0.01], ["offsetY", "Y offset", -0.5, 0.5, 0.01],
    ["horizonScale", "Horizon", 0.5, 1.5, 0.01],
  ];
  const renderValues = new Map<keyof Calibration, HTMLOutputElement>();
  for (const [key, label, min, max, step] of ranges) {
    const row = document.createElement("label"); row.className = "range-row";
    const output = document.createElement("output"); output.textContent = String(value[key]); renderValues.set(key, output);
    const input = document.createElement("input"); input.type = "range"; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value[key]);
    input.addEventListener("input", () => { value = { ...value, [key]: Number(input.value) }; output.textContent = input.value; onChange(value); });
    row.append(document.createTextNode(label), output, input); panel.append(row);
  }
  for (const key of ["mirrorX", "mirrorY"] as const) {
    const row = document.createElement("label"); row.className = "check-row";
    const input = document.createElement("input"); input.type = "checkbox"; input.checked = value[key];
    input.addEventListener("change", () => { value = { ...value, [key]: input.checked }; onChange(value); });
    row.append(input, document.createTextNode(key === "mirrorX" ? "Mirror X" : "Mirror Y")); panel.append(row);
  }
  const reset = document.createElement("button"); reset.type = "button"; reset.textContent = "Reset identity";
  reset.addEventListener("click", () => { value = { ...IDENTITY_CALIBRATION }; onChange(value); panel.replaceWith(createCalibrationPanel(value, onChange)); });
  panel.append(reset); return panel;
}
