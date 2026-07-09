import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ru from "./locales/ru.json";
import type { Language } from "../types/settings";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ru: { translation: ru },
};

export function applyDocumentLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  applyDocumentLanguage(lng as Language);
});

export default i18n;
