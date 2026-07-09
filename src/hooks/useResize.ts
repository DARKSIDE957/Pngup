import { useCallback, useRef } from "react";

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

interface ResizeState {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  corner: ResizeCorner;
}

interface UseResizeOptions {
  width: number;
  height: number;
  minSize?: number;
  maxSize?: number;
  onResize: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
}

export function useResize({
  width,
  height,
  minSize = 120,
  maxSize = 1200,
  onResize,
  onResizeEnd,
}: UseResizeOptions) {
  const stateRef = useRef<ResizeState | null>(null);

  const clamp = useCallback(
    (value: number) => Math.min(maxSize, Math.max(minSize, value)),
    [maxSize, minSize],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const state = stateRef.current;
      if (!state) return;

      const deltaX = event.clientX - state.startX;
      const aspect = state.startWidth / state.startHeight;

      let nextWidth = state.startWidth;
      let nextHeight = state.startHeight;

      if (state.corner === "se") {
        nextWidth = clamp(state.startWidth + deltaX);
        nextHeight = nextWidth / aspect;
      } else if (state.corner === "sw") {
        nextWidth = clamp(state.startWidth - deltaX);
        nextHeight = nextWidth / aspect;
      } else if (state.corner === "ne") {
        nextWidth = clamp(state.startWidth + deltaX);
        nextHeight = nextWidth / aspect;
      } else if (state.corner === "nw") {
        nextWidth = clamp(state.startWidth - deltaX);
        nextHeight = nextWidth / aspect;
      }

      if (nextHeight > maxSize) {
        nextHeight = maxSize;
        nextWidth = nextHeight * aspect;
      }
      if (nextHeight < minSize) {
        nextHeight = minSize;
        nextWidth = nextHeight * aspect;
      }

      onResize(Math.round(nextWidth), Math.round(nextHeight));
    },
    [clamp, maxSize, minSize, onResize],
  );

  const onPointerUp = useCallback(() => {
    const state = stateRef.current;
    stateRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    if (state) {
      onResizeEnd?.(width, height);
    }
  }, [height, onPointerMove, onResizeEnd, width]);

  const startResize = useCallback(
    (corner: ResizeCorner, event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      stateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startWidth: width,
        startHeight: height,
        corner,
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [height, onPointerMove, onPointerUp, width],
  );

  return { startResize };
}
