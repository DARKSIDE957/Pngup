import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { Language, Theme } from "../types/settings";

const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
];

interface ControlPanelProps {
  opacity: number;
  clickThrough: boolean;
  theme: Theme;
  language: Language;
  scale: number;
  onOpacityChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onToggleClickThrough: () => void;
  onToggleTheme: () => void;
  onLanguageChange: (language: Language) => void;
  onPickPhoto: () => void;
  onHide: () => void;
  onCollapse: () => void;
  onDragStart: () => void;
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="3" width="7.5" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 11.5h5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="11.8" cy="4.2" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function ControlPanel({
  opacity,
  clickThrough,
  theme,
  language,
  scale,
  onOpacityChange,
  onScaleChange,
  onToggleClickThrough,
  onToggleTheme,
  onLanguageChange,
  onPickPhoto,
  onHide,
  onCollapse,
  onDragStart,
}: ControlPanelProps) {
  const { t } = useTranslation();
  const opacityPct = Math.round(opacity * 100);
  const scalePct = Math.round(scale * 100);

  return (
    <div className="control-panel">
      <div className="panel-header">
        <button
          type="button"
          className="panel-grip"
          title={t("dragPanel")}
          aria-label={t("dragPanel")}
          onPointerDown={(event) => {
            event.preventDefault();
            onDragStart();
          }}
        >
          <span className="grip-bars" aria-hidden="true" />
        </button>

        <div className="panel-brand">
          <span className="panel-mark" aria-hidden="true">
            <PinIcon />
          </span>
          <span className="panel-title">{t("appName")}</span>
        </div>

        <div className="panel-header-actions">
          <button
            type="button"
            className="panel-icon-btn"
            onClick={(event) => {
              event.stopPropagation();
              onCollapse();
            }}
            title={t("collapsePanel")}
            aria-label={t("collapsePanel")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button
            type="button"
            className="panel-icon-btn"
            onClick={(event) => {
              event.stopPropagation();
              onHide();
            }}
            title={t("hideUi")}
            aria-label={t("hideUi")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3.5 7h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <button className="panel-cta" type="button" onClick={onPickPhoto}>
        <PinIcon />
        <span>{t("pickPhoto")}</span>
      </button>

      <div className="panel-sliders">
        <label className="panel-slider">
          <div className="panel-slider-head">
            <span>{t("opacity")}</span>
            <span className="panel-slider-value">{opacityPct}%</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.01}
            value={opacity}
            style={{ "--range-progress": `${((opacity - 0.2) / 0.8) * 100}%` } as CSSProperties}
            onChange={(event) => onOpacityChange(Number(event.currentTarget.value))}
          />
        </label>

        <label className="panel-slider">
          <div className="panel-slider-head">
            <span>{t("scale")}</span>
            <span className="panel-slider-value">{scalePct}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.01}
            value={scale}
            style={{ "--range-progress": `${((scale - 0.5) / 1.5) * 100}%` } as CSSProperties}
            onChange={(event) => onScaleChange(Number(event.currentTarget.value))}
          />
        </label>
      </div>

      <label
        className={`panel-toggle ${clickThrough ? "is-on" : ""}`}
        title={clickThrough ? t("passClicksOnHint") : t("passClicksOffHint")}
      >
        <span className="panel-toggle-copy">
          <strong>{clickThrough ? t("passClicksOn") : t("passClicksOff")}</strong>
        </span>
        <input
          type="checkbox"
          checked={clickThrough}
          onChange={onToggleClickThrough}
          aria-label={t("passClicksOff")}
        />
        <span className="panel-switch" aria-hidden="true" />
      </label>

      <div className="panel-footer">
        <button
          type="button"
          className="panel-theme-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? t("themeLight") : t("themeDark")}
        >
          {theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="3.2" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M7.5 1.4v1.4M7.5 12.2v1.4M1.4 7.5h1.4M12.2 7.5h1.4M3 3l1 1M11 11l1 1M12 3l-1 1M3 12l-1 1"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M7.8 2.2a5.2 5.2 0 1 0 5.6 5.6A4.2 4.2 0 0 1 7.8 2.2Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <select
          className="panel-select"
          value={language}
          onChange={(event) =>
            onLanguageChange(event.currentTarget.value as Language)
          }
          aria-label={t("language")}
        >
          {LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
