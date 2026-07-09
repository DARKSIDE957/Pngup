import { convertFileSrc } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { useResize } from "../hooks/useResize";
import { useWindowDrag } from "../hooks/useDrag";

interface PhotoOverlayProps {
  photoPath: string | null;
  width: number;
  height: number;
  opacity: number;
  canInteract: boolean;
  onResize: (width: number, height: number) => void;
  onResizeEnd: (width: number, height: number) => void;
  onPickPhoto: () => void;
}

export function PhotoOverlay({
  photoPath,
  width,
  height,
  opacity,
  canInteract,
  onResize,
  onResizeEnd,
  onPickPhoto,
}: PhotoOverlayProps) {
  const { t } = useTranslation();
  const startDrag = useWindowDrag();
  const { startResize } = useResize({
    width,
    height,
    onResize,
    onResizeEnd,
  });

  if (!photoPath) {
    return (
      <div className="empty-state">
        <div className="empty-card">
          <h1>{t("noPhotoTitle")}</h1>
          <p>{t("noPhotoBody")}</p>
          <button className="primary" type="button" onClick={onPickPhoto}>
            {t("pickPhoto")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`photo-frame ${canInteract ? "is-draggable" : ""}`}
      style={{ width, height }}
    >
      <img
        className="photo-image"
        src={convertFileSrc(photoPath)}
        alt=""
        style={{ opacity }}
        draggable={false}
      />

      {canInteract && (
        <div
          className="photo-hit-layer"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            if ((event.target as HTMLElement).closest(".resize-handle")) return;
            void startDrag();
          }}
        />
      )}

      {canInteract && (
        <>
          <button
            type="button"
            className="resize-handle nw"
            aria-label="Resize top left"
            onPointerDown={(event) => startResize("nw", event)}
          />
          <button
            type="button"
            className="resize-handle ne"
            aria-label="Resize top right"
            onPointerDown={(event) => startResize("ne", event)}
          />
          <button
            type="button"
            className="resize-handle sw"
            aria-label="Resize bottom left"
            onPointerDown={(event) => startResize("sw", event)}
          />
          <button
            type="button"
            className="resize-handle se"
            aria-label="Resize bottom right"
            onPointerDown={(event) => startResize("se", event)}
          />
        </>
      )}
    </div>
  );
}
