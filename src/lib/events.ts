import { emit, listen } from "@tauri-apps/api/event";
import type { OverlaySettings } from "../types/settings";

export const SETTINGS_EVENT = "settings-changed";

export type SettingsPatch = Partial<OverlaySettings>;

export function emitSettingsChange(patch: SettingsPatch) {
  void emit(SETTINGS_EVENT, patch);
}

export async function listenSettingsChange(
  handler: (patch: SettingsPatch) => void,
): Promise<() => void> {
  const unlisten = await listen<SettingsPatch>(SETTINGS_EVENT, (event) => {
    handler(event.payload);
  });
  return unlisten;
}
