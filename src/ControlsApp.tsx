import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ControlPanel } from "./components/ControlPanel";
import { applyDocumentLanguage } from "./i18n";
import { emitSettingsChange, listenSettingsChange } from "./lib/events";
import { loadSettings, patchSettings } from "./lib/settings";
import {
  captureWindowPosition,
  hideControlsWindow,
  restoreWindowPosition,
  showControlsWindow,
  syncControlsWindowSize,
} from "./lib/window";
import type { Language, Theme } from "./types/settings";

const DRAG_THRESHOLD = 6;

export function ControlsApp() {
  const { i18n, t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [clickThrough, setClickThrough] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");

  const pointerRef = useRef({ x: 0, y: 0, moved: false, dragging: false });
  const expandedRef = useRef(false);

  const startWindowDrag = useCallback(() => {
    void getCurrentWindow().startDragging();
  }, []);

  const applyTheme = useCallback((nextTheme: Theme) => {
    document.documentElement.dataset.theme = nextTheme;
  }, []);

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

    const patch = {
      photoPath: selected,
      width: 360,
      height: 360,
    };
    patchSettings(patch);
    emitSettingsChange(patch);
  }, []);

  const handleOpacityChange = useCallback((value: number) => {
    setOpacity(value);
    patchSettings({ opacity: value });
    emitSettingsChange({ opacity: value });
  }, []);

  const handleScaleChange = useCallback((value: number) => {
    setScale(value);
    patchSettings({ scale: value });
    emitSettingsChange({ scale: value });
  }, []);

  const handleToggleClickThrough = useCallback(() => {
    setClickThrough((current) => {
      const next = !current;
      patchSettings({ clickThrough: next });
      emitSettingsChange({ clickThrough: next });
      return next;
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      patchSettings({ theme: next });
      emitSettingsChange({ theme: next });
      return next;
    });
  }, [applyTheme]);

  const handleLanguageChange = useCallback(
    (nextLanguage: Language) => {
      setLanguage(nextLanguage);
      applyDocumentLanguage(nextLanguage);
      void i18n.changeLanguage(nextLanguage);
      patchSettings({ language: nextLanguage });
      emitSettingsChange({ language: nextLanguage });
    },
    [i18n],
  );

  const setExpandedSafe = useCallback(async (next: boolean) => {
    expandedRef.current = next;
    setExpanded(next);
    patchSettings({ controlsExpanded: next });
    await syncControlsWindowSize(next);
  }, []);

  const handleToggleExpanded = useCallback(() => {
    void setExpandedSafe(!expandedRef.current);
  }, [setExpandedSafe]);

  const handleCollapse = useCallback(() => {
    void setExpandedSafe(false);
  }, [setExpandedSafe]);

  const handleHide = useCallback(async () => {
    patchSettings({ controlsHidden: true, controlsExpanded: false });
    expandedRef.current = false;
    setExpanded(false);
    await syncControlsWindowSize(false);
    await hideControlsWindow();
  }, []);

  const handleShowControls = useCallback(async () => {
    patchSettings({ controlsHidden: false });
    await showControlsWindow();
    await setExpandedSafe(true);
  }, [setExpandedSafe]);

  const handleBallPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        moved: false,
        dragging: false,
      };
    },
    [],
  );

  const handleBallPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const state = pointerRef.current;
      if (state.dragging) return;

      const dx = event.clientX - state.x;
      const dy = event.clientY - state.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        state.moved = true;
        state.dragging = true;
        startWindowDrag();
      }
    },
    [startWindowDrag],
  );

  const handleBallPointerUp = useCallback(() => {
    const state = pointerRef.current;
    if (!state.moved && !state.dragging) {
      handleToggleExpanded();
    }
    pointerRef.current = { x: 0, y: 0, moved: false, dragging: false };
  }, [handleToggleExpanded]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const settings = await loadSettings();
      if (cancelled) return;

      expandedRef.current = settings.controlsExpanded;
      setExpanded(settings.controlsExpanded);
      setOpacity(settings.opacity);
      setScale(settings.scale);
      setClickThrough(settings.clickThrough);
      setTheme(settings.theme);
      setLanguage(settings.language);
      applyTheme(settings.theme);
      applyDocumentLanguage(settings.language);
      void i18n.changeLanguage(settings.language);
      await restoreWindowPosition(settings.controlsX, settings.controlsY);
      await syncControlsWindowSize(settings.controlsExpanded);

      if (settings.controlsHidden) {
        await hideControlsWindow();
      } else {
        await showControlsWindow();
      }

      setReady(true);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applyTheme, i18n]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void captureWindowPosition().then((position) => {
        patchSettings({ controlsX: position.x, controlsY: position.y });
      });
    }, 1500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    void listenSettingsChange((patch) => {
      if (patch.opacity !== undefined) setOpacity(patch.opacity);
      if (patch.scale !== undefined) setScale(patch.scale);
      if (patch.clickThrough !== undefined) setClickThrough(patch.clickThrough);
      if (patch.theme !== undefined) {
        setTheme(patch.theme);
        applyTheme(patch.theme);
      }
      if (patch.language !== undefined) {
        setLanguage(patch.language);
        applyDocumentLanguage(patch.language);
        void i18n.changeLanguage(patch.language);
      }
    }).then((unlisten) => unsubs.push(unlisten));

    void listen<string>("tray-action", (event) => {
      switch (event.payload) {
        case "pick-photo":
          void pickPhoto();
          break;
        case "toggle-click-through":
          handleToggleClickThrough();
          break;
        case "toggle-theme":
          handleToggleTheme();
          break;
        case "show-controls":
          void handleShowControls();
          break;
        default:
          break;
      }
    }).then((unlisten) => unsubs.push(unlisten));

    return () => unsubs.forEach((fn) => fn());
  }, [
    applyTheme,
    handleShowControls,
    handleToggleClickThrough,
    handleToggleTheme,
    i18n,
    pickPhoto,
  ]);

  useEffect(() => {
    async function setupShortcuts() {
      try {
        await register("Control+Shift+H", () => {
          void handleShowControls();
        });
        await register("Control+Shift+O", () => {
          void pickPhoto();
        });
        await register("Control+Shift+P", () => {
          handleToggleClickThrough();
        });
      } catch {
        // Shortcuts may already be registered during hot reload.
      }
    }

    void setupShortcuts();

    return () => {
      void unregister("Control+Shift+H");
      void unregister("Control+Shift+O");
      void unregister("Control+Shift+P");
    };
  }, [handleShowControls, handleToggleClickThrough, pickPhoto]);

  if (!ready) return null;

  return (
    <div className={`controls-shell ${expanded ? "is-expanded" : ""}`}>
      {expanded ? (
        <ControlPanel
          opacity={opacity}
          clickThrough={clickThrough}
          theme={theme}
          language={language}
          scale={scale}
          onOpacityChange={handleOpacityChange}
          onScaleChange={handleScaleChange}
          onToggleClickThrough={handleToggleClickThrough}
          onToggleTheme={handleToggleTheme}
          onLanguageChange={handleLanguageChange}
          onPickPhoto={() => void pickPhoto()}
          onHide={() => void handleHide()}
          onCollapse={handleCollapse}
          onDragStart={startWindowDrag}
        />
      ) : (
        <button
          type="button"
          className="settings-ball"
          title={t("showUi")}
          aria-label={t("showUi")}
          onPointerDown={handleBallPointerDown}
          onPointerMove={handleBallPointerMove}
          onPointerUp={handleBallPointerUp}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="4" y="4.5" width="9" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6.5 14h7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="14.8" cy="5.5" r="1.8" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}
