import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useRef } from "react";

export function useClickThrough(enabled: boolean) {
  const activeRef = useRef(false);

  const apply = useCallback(async (shouldIgnore: boolean) => {
    const window = getCurrentWindow();
    if (window.label !== "main") return;
    if (activeRef.current === shouldIgnore) return;
    activeRef.current = shouldIgnore;
    await window.setIgnoreCursorEvents(shouldIgnore);
  }, []);

  useEffect(() => {
    void apply(enabled);
  }, [enabled, apply]);

  useEffect(() => {
    const window = getCurrentWindow();
    if (window.label !== "main") return;
    void window.setIgnoreCursorEvents(false);
    return () => {
      void window.setIgnoreCursorEvents(false);
    };
  }, []);
}
