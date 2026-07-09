import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback } from "react";

export function useWindowDrag() {
  return useCallback(async () => {
    await getCurrentWindow().startDragging();
  }, []);
}
