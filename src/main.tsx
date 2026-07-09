import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ControlsApp } from "./ControlsApp";
import { PhotoApp } from "./PhotoApp";
import "./i18n";
import "./styles/themes.css";
import "./styles/overlay.css";

async function bootstrap() {
  const label = (await getCurrentWindow()).label;
  const root = document.getElementById("root") as HTMLElement;

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      {label === "controls" ? <ControlsApp /> : <PhotoApp />}
    </React.StrictMode>,
  );
}

void bootstrap();
