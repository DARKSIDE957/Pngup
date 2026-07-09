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
          <span className="grip-dots" />
        </button>

        <span className="panel-title">{t("appName")}</span>

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
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
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
              <path d="M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <button className="panel-btn primary full" type="button" onClick={onPickPhoto}>
        {t("pickPhoto")}
      </button>

      <label className="panel-field">
        <span className="panel-label">{t("opacity")}</span>
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.01}
          value={opacity}
          onChange={(event) => onOpacityChange(Number(event.currentTarget.value))}
        />
        <span className="panel-value">{opacityPct}%</span>
      </label>

      <label className="panel-field">
        <span className="panel-label">{t("scale")}</span>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.01}
          value={scale}
          onChange={(event) => onScaleChange(Number(event.currentTarget.value))}
        />
        <span className="panel-value">{scalePct}%</span>
      </label>

      <div className="panel-row">
        <button
          type="button"
          className={`panel-btn flex ${clickThrough ? "is-active" : ""}`}
          onClick={onToggleClickThrough}
          aria-pressed={clickThrough}
          title={clickThrough ? t("passClicksOnHint") : t("passClicksOffHint")}
        >
          {clickThrough ? t("passClicksOn") : t("passClicksOff")}
        </button>
      </div>

      <div className="panel-row">
        <button type="button" className="panel-btn flex" onClick={onToggleTheme}>
          {theme === "dark" ? t("themeDark") : t("themeLight")}
        </button>

        <select
          className="panel-select flex"
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
