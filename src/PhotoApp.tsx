import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PhotoOverlay } from "./components/PhotoOverlay";
import { useClickThrough } from "./hooks/useClickThrough";
import { applyDocumentLanguage } from "./i18n";
import { emitSettingsChange, listenSettingsChange } from "./lib/events";
import { loadSettings, patchSettings } from "./lib/settings";
import {
  captureWindowPosition,
  ensurePhotoWindowInteractive,
  restoreWindowPosition,
  syncPhotoWindowSize,
} from "./lib/window";
import { DEFAULT_SETTINGS } from "./types/settings";

const BASE_WIDTH = DEFAULT_SETTINGS.width;
const BASE_HEIGHT = DEFAULT_SETTINGS.height;

export function PhotoApp() {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [width, setWidth] = useState(BASE_WIDTH);
  const [height, setHeight] = useState(BASE_HEIGHT);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [clickThrough, setClickThrough] = useState(false);

  const canInteract = !clickThrough;
  const displayWidth = useMemo(() => Math.round(width * scale), [scale, width]);
  const displayHeight = useMemo(() => Math.round(height * scale), [height, scale]);
  const hasPhoto = Boolean(photoPath);
  const scaleRef = useRef(scale);

  useClickThrough(clickThrough);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const pickPhoto = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg", "webp", "bmp"],
        },
      ],
    });

    if (!selected || Array.isArray(selected)) return;

    setPhotoPath(selected);
    setScale(1);
    setWidth(BASE_WIDTH);
    setHeight(BASE_HEIGHT);
    const patch = {
      photoPath: selected,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    };
    patchSettings(patch);
    emitSettingsChange(patch);
  }, []);

  const handleResize = useCallback((nextWidth: number, nextHeight: number) => {
    setWidth(nextWidth);
    setHeight(nextHeight);
    setScale(1);
  }, []);

  const handleResizeEnd = useCallback((nextWidth: number, nextHeight: number) => {
    const patch = { width: nextWidth, height: nextHeight };
    patchSettings(patch);
    emitSettingsChange(patch);
    void captureWindowPosition().then((position) => {
      patchSettings({ x: position.x, y: position.y });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await ensurePhotoWindowInteractive();
      const settings = await loadSettings();
      if (cancelled) return;

      setPhotoPath(settings.photoPath);
      setWidth(settings.width);
      setHeight(settings.height);
      setOpacity(settings.opacity);
      setScale(settings.scale);
      setClickThrough(settings.clickThrough);
      applyDocumentLanguage(settings.language);
      void i18n.changeLanguage(settings.language);
      await restoreWindowPosition(settings.x, settings.y);
      setReady(true);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [i18n]);

  useEffect(() => {
    if (!ready) return;
    void syncPhotoWindowSize(displayWidth, displayHeight, hasPhoto);
  }, [displayHeight, displayWidth, hasPhoto, ready]);

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    void listenSettingsChange((patch) => {
      if (patch.photoPath !== undefined) setPhotoPath(patch.photoPath);
      if (patch.width !== undefined) setWidth(patch.width);
      if (patch.height !== undefined) setHeight(patch.height);
      if (patch.opacity !== undefined) setOpacity(patch.opacity);
      if (patch.clickThrough !== undefined) setClickThrough(patch.clickThrough);
      if (patch.scale !== undefined) setScale(patch.scale);

      if (patch.width !== undefined || patch.height !== undefined) {
        setScale(1);
      }
    }).then((unlisten) => unsubs.push(unlisten));

    void listen<string>("tray-action", (event) => {
      if (event.payload === "pick-photo") void pickPhoto();
      if (event.payload === "toggle-click-through") {
        setClickThrough((current) => {
          const next = !current;
          patchSettings({ clickThrough: next });
          emitSettingsChange({ clickThrough: next });
          return next;
        });
      }
      if (event.payload === "show") {
        void ensurePhotoWindowInteractive();
      }
    }).then((unlisten) => unsubs.push(unlisten));

    return () => unsubs.forEach((fn) => fn());
  }, [pickPhoto]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void captureWindowPosition().then((position) => {
        patchSettings({ x: position.x, y: position.y });
      });
    }, 1500);
    return () => window.clearInterval(interval);
  }, []);

  if (!ready) return null;

  return (
    <div className="app-shell photo-shell">
      <div className="overlay-stage">
        <PhotoOverlay
          photoPath={photoPath}
          width={displayWidth}
          height={displayHeight}
          opacity={opacity}
          canInteract={canInteract}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          onPickPhoto={() => void pickPhoto()}
        />
      </div>
    </div>
  );
}
