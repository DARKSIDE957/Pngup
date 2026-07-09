export type Theme = "dark" | "light";

export type Language = "en" | "ar" | "es" | "fr" | "de" | "ru";

export interface OverlaySettings {
  photoPath: string | null;
  width: number;
  height: number;
  x: number | null;
  y: number | null;
  opacity: number;
  scale: number;
  clickThrough: boolean;
  theme: Theme;
  language: Language;
  controlsX: number | null;
  controlsY: number | null;
  controlsExpanded: boolean;
  controlsHidden: boolean;
}

export const DEFAULT_SETTINGS: OverlaySettings = {
  photoPath: null,
  width: 360,
  height: 360,
  x: null,
  y: null,
  opacity: 1,
  scale: 1,
  clickThrough: false,
  theme: "dark",
  language: "en",
  controlsX: null,
  controlsY: null,
  controlsExpanded: false,
  controlsHidden: false,
};

export const WINDOW_PADDING = 12;
export const EMPTY_STATE_WIDTH = 300;
export const EMPTY_STATE_HEIGHT = 220;

export const BALL_SIZE = 48;
export const PANEL_WIDTH = 292;
export const PANEL_HEIGHT = 318;
