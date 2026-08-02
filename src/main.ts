import "./style.css";
import { dateAtOffset, advanceTime } from "./astronomy/time";
import { stars } from "./catalog/stars";
import { cygnus } from "./catalog/constellations";
import { renderSky, projectStars } from "./rendering/skyRenderer";
import { createAppState } from "./state/appState";
import { loadCalibration, saveCalibration } from "./storage/settings";
import { createControls, updateTimeControls, type ControlActions } from "./ui/controls";
import type { AppState, Calibration } from "./types";

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Application mount point ${selector} is missing.`);
  return element;
}

const canvas = requiredElement<HTMLCanvasElement>("#sky");
const app = requiredElement<HTMLDivElement>("#app");
const maybeContext = canvas.getContext("2d");
if (maybeContext === null) throw new Error("Canvas 2D is unavailable.");
const context: CanvasRenderingContext2D = maybeContext;

let state: AppState = createAppState();
const loaded = loadCalibration(); state.calibration = loaded.calibration; state.message = loaded.error;
let cssWidth = 0; let cssHeight = 0; let previousFrame = performance.now();

function resize(): void {
  const ratio = Math.max(1, window.devicePixelRatio || 1); cssWidth = window.innerWidth; cssHeight = window.innerHeight;
  canvas.width = Math.round(cssWidth * ratio); canvas.height = Math.round(cssHeight * ratio);
  canvas.style.width = `${cssWidth}px`; canvas.style.height = `${cssHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function patch(update: Partial<AppState>): void { state = { ...state, ...update }; mountControls(); }
function notify(message: string): void { state.message = message; mountControls(); window.setTimeout(() => { if (state.message === message) patch({ message: null }); }, 5000); }

const actions: ControlActions = {
  onResetTime: () => { const now = new Date(); state = { ...state, now, anchorTime: new Date(now), offsetHours: 0, playing: false }; mountControls(); },
  onOffset: (hours) => {
    state = { ...state, offsetHours: hours, now: dateAtOffset(state.anchorTime, hours) };
    updateTimeControls(app, state);
  },
  onTogglePlay: () => patch({ playing: !state.playing }),
  onPatch: patch,
  onCalibration: (calibration: Calibration) => { state.calibration = calibration; const error = saveCalibration(calibration); if (error) notify(error); },
  onProjection: async () => {
    state.projectionMode = true; state.controlsVisible = false; document.body.classList.add("projection"); mountControls();
    try { await document.documentElement.requestFullscreen(); }
    catch { notify("Fullscreen was blocked. Projection mode is still active; use H for controls."); }
  },
};

function mountControls(): void {
  app.replaceChildren(createControls(state, actions));
  let toast = document.querySelector<HTMLDivElement>("#message");
  if (state.message) { if (!toast) { toast = document.createElement("div"); toast.id = "message"; document.body.append(toast); } toast.textContent = state.message; }
  else toast?.remove();
}

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && state.projectionMode) {
    state.projectionMode = false; state.controlsVisible = true; document.body.classList.remove("projection"); mountControls();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "h") { event.preventDefault(); patch({ controlsVisible: !state.controlsVisible }); }
});
window.addEventListener("resize", resize); resize(); mountControls();

function frame(timestamp: number): void {
  const deltaSeconds = Math.min((timestamp - previousFrame) / 1000, 0.25); previousFrame = timestamp;
  if (state.playing) {
    const advanced = advanceTime(state.now, state.offsetHours, deltaSeconds);
    state.now = advanced.date; state.offsetHours = advanced.offsetHours;
    updateTimeControls(app, state);
    if (advanced.reachedBoundary) { state.playing = false; mountControls(); }
  }
  const projected = projectStars(stars, state.now, cssWidth, cssHeight, state.calibration);
  renderSky(context, cssWidth, cssHeight, projected, cygnus, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
