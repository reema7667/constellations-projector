import type { Calibration, Constellation, HorizontalCoordinate, ScreenPoint, Star } from "../types";
import { starToHorizontal } from "../astronomy/coordinates";
import { applyCalibration, logicalRadius } from "./calibration";
import { compassToSkyViewVector, horizontalToCompassVector, isAboveHorizon } from "./projection";
import { theme } from "./theme";

export interface ProjectedStar { star: Star; horizontal: HorizontalCoordinate; point: ScreenPoint }

export function projectHorizontal(
  horizontal: HorizontalCoordinate, width: number, height: number, calibration: Calibration,
): ScreenPoint {
  if (!isAboveHorizon(horizontal)) return { x: 0, y: 0, visible: false };
  const compass = horizontalToCompassVector(horizontal, logicalRadius(width, height, calibration));
  return applyCalibration(compassToSkyViewVector(compass), width, height, calibration);
}

export function projectStars(stars: readonly Star[], date: Date, width: number, height: number, calibration: Calibration): ProjectedStar[] {
  return stars.map((star) => {
    const horizontal = starToHorizontal(star, date);
    return { star, horizontal, point: projectHorizontal(horizontal, width, height, calibration) };
  });
}

export function visibleEdges(
  constellation: Constellation, projected: ReadonlyMap<string, ProjectedStar>,
): [ProjectedStar, ProjectedStar][] {
  const result: [ProjectedStar, ProjectedStar][] = [];
  for (const [fromId, toId] of constellation.edges) {
    const from = projected.get(fromId);
    const to = projected.get(toId);
    if (from?.point.visible && to?.point.visible) result.push([from, to]);
  }
  return result;
}

function drawCalibrationOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, calibration: Calibration): void {
  const radius = logicalRadius(width, height, calibration);
  ctx.save();
  ctx.strokeStyle = theme.overlay;
  ctx.fillStyle = theme.overlay;
  ctx.lineWidth = 1.5;
  const centre = applyCalibration({ x: 0, y: 0 }, width, height, calibration);
  ctx.beginPath(); ctx.arc(centre.x, centre.y, radius * calibration.scale, 0, Math.PI * 2); ctx.stroke();
  const cardinal: [string, number][] = [["N", 0], ["E", 90], ["S", 180], ["W", 270]];
  for (const [label, azimuth] of cardinal) {
    const compass = horizontalToCompassVector({ altitudeDegrees: 0, azimuthDegrees: azimuth }, radius);
    const point = applyCalibration(compassToSkyViewVector(compass), width, height, calibration);
    ctx.beginPath(); ctx.moveTo(centre.x, centre.y); ctx.lineTo(point.x, point.y); ctx.stroke();
    ctx.font = "700 28px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, point.x, point.y);
  }
  ctx.beginPath(); ctx.arc(centre.x, centre.y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.font = "600 14px system-ui"; ctx.textAlign = "center";
  ctx.fillText("ZENITH", centre.x, centre.y - 15);
  ctx.fillText(`Rotation ${calibration.rotationDegrees.toFixed(0)}° · Align N with the room’s north wall`, width / 2, height - 28);
  ctx.restore();
}

export function renderSky(
  ctx: CanvasRenderingContext2D, width: number, height: number, projectedStars: readonly ProjectedStar[], constellation: Constellation,
  options: { showLabels: boolean; showConstellationLines: boolean; dimContext: boolean; calibrationMode: boolean; calibration: Calibration },
): void {
  ctx.fillStyle = theme.background; ctx.fillRect(0, 0, width, height);
  const byId = new Map(projectedStars.map((star) => [star.star.id, star]));
  if (options.showConstellationLines) {
    ctx.strokeStyle = theme.line; ctx.lineWidth = 1.4;
    for (const [from, to] of visibleEdges(constellation, byId)) {
      ctx.beginPath(); ctx.moveTo(from.point.x, from.point.y); ctx.lineTo(to.point.x, to.point.y); ctx.stroke();
    }
  }
  for (const item of projectedStars) {
    if (!item.point.visible) continue;
    const inConstellation = item.star.constellationId === constellation.id;
    ctx.fillStyle = inConstellation ? theme.cygnus : options.dimContext ? theme.dimmed : theme.context;
    const radius = Math.max(1.2, 4.8 - item.star.magnitude * 0.85);
    ctx.beginPath(); ctx.arc(item.point.x, item.point.y, radius, 0, Math.PI * 2); ctx.fill();
    if (options.showLabels && inConstellation) {
      ctx.font = "12px system-ui"; ctx.textAlign = "left"; ctx.fillText(item.star.name, item.point.x + 8, item.point.y - 7);
    }
  }
  const label = byId.get(constellation.labelStarId);
  if (options.showLabels && label?.point.visible) {
    ctx.fillStyle = theme.line; ctx.font = "600 15px system-ui"; ctx.textAlign = "center";
    ctx.fillText(constellation.name, label.point.x, label.point.y + 28);
  }
  if (options.calibrationMode) drawCalibrationOverlay(ctx, width, height, options.calibration);
}
