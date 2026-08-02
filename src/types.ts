export interface Star {
  id: string;
  name: string;
  raHours: number;
  declinationDegrees: number;
  magnitude: number;
  constellationId?: string;
}

export interface Constellation {
  id: string;
  name: string;
  starIds: string[];
  edges: readonly (readonly [string, string])[];
  labelStarId: string;
}

export interface ObserverLocation { latitude: number; longitude: number; elevationMeters: number }
export interface HorizontalCoordinate { altitudeDegrees: number; azimuthDegrees: number }
export interface Vector2 { x: number; y: number }
export type CompassVector = Vector2;
export type SkyViewVector = Vector2;
export interface ScreenPoint extends Vector2 { visible: boolean }

export interface Calibration {
  rotationDegrees: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  mirrorX: boolean;
  mirrorY: boolean;
  horizonScale: number;
}

export interface AppState {
  now: Date;
  anchorTime: Date;
  offsetHours: number;
  playing: boolean;
  showLabels: boolean;
  showConstellationLines: boolean;
  dimContext: boolean;
  calibrationMode: boolean;
  projectionMode: boolean;
  controlsVisible: boolean;
  message: string | null;
  calibration: Calibration;
}
