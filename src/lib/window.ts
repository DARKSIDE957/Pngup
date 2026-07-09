import { LogicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  BALL_SIZE,
  EMPTY_STATE_HEIGHT,
  EMPTY_STATE_WIDTH,
  PANEL_HEIGHT,
  PANEL_WIDTH,
  WINDOW_PADDING,
} from "../types/settings";

export async function syncPhotoWindowSize(photoWidth: number, photoHeight: number, hasPhoto: boolean) {
  const window = getCurrentWindow();
  const width = hasPhoto ? photoWidth + WINDOW_PADDING * 2 : EMPTY_STATE_WIDTH;
  const height = hasPhoto ? photoHeight + WINDOW_PADDING * 2 : EMPTY_STATE_HEIGHT;
  await window.setSize(new LogicalSize(width, height));
}

export async function syncControlsWindowSize(expanded: boolean) {
  const window = getCurrentWindow();
  const width = expanded ? PANEL_WIDTH : BALL_SIZE;
  const height = expanded ? PANEL_HEIGHT : BALL_SIZE;
  await window.setSize(new LogicalSize(width, height));
}

export async function restoreWindowPosition(x: number | null, y: number | null) {
  if (x === null || y === null) return;
  const window = getCurrentWindow();
  await window.setPosition(new PhysicalPosition(x, y));
}

export async function captureWindowPosition(): Promise<{ x: number; y: number }> {
  const window = getCurrentWindow();
  const position = await window.outerPosition();
  return { x: position.x, y: position.y };
}

export async function hideControlsWindow() {
  const window = getCurrentWindow();
  await window.hide();
}

export async function showControlsWindow() {
  const window = getCurrentWindow();
  await window.show();
  await window.setFocus();
}

export async function ensurePhotoWindowInteractive() {
  const window = getCurrentWindow();
  if (window.label !== "main") return;
  await window.setIgnoreCursorEvents(false);
}
