import { load } from "@tauri-apps/plugin-store";
import {
  DEFAULT_SETTINGS,
  type Language,
  type OverlaySettings,
  type Theme,
} from "../types/settings";

const STORE_PATH = "settings.json";

let storePromise: ReturnType<typeof load> | null = null;
let memoryCache: OverlaySettings | null = null;

async function getStore() {
  if (!storePromise) {
    storePromise = load(STORE_PATH, {
      autoSave: true,
      defaults: {},
    });
  }
  return storePromise;
}

export async function loadSettings(): Promise<OverlaySettings> {
  if (memoryCache) {
    return memoryCache;
  }

  const store = await getStore();
  const stored = (await store.get<Partial<OverlaySettings>>("overlay")) ?? {};
  memoryCache = { ...DEFAULT_SETTINGS, ...stored };
  return memoryCache;
}

export async function saveSettings(settings: OverlaySettings): Promise<void> {
  memoryCache = settings;
  const store = await getStore();
  await store.set("overlay", settings);
  await store.save();
}

export function patchSettings(
  patch: Partial<OverlaySettings>,
): OverlaySettings {
  const current = memoryCache ?? { ...DEFAULT_SETTINGS };
  const next = { ...current, ...patch };
  memoryCache = next;
  void saveSettings(next);
  return next;
}

export function isTheme(value: string): value is Theme {
  return value === "dark" || value === "light";
}

export function isLanguage(value: string): value is Language {
  return ["en", "ar", "es", "fr", "de", "ru"].includes(value);
}
