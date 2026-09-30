import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enEditor from "./locales/en/editor.json";
import enSearch from "./locales/en/search.json";
import enSettings from "./locales/en/settings.json";
import enSidebar from "./locales/en/sidebar.json";
import faCommon from "./locales/fa/common.json";
import faEditor from "./locales/fa/editor.json";
import faSearch from "./locales/fa/search.json";
import faSettings from "./locales/fa/settings.json";
import faSidebar from "./locales/fa/sidebar.json";

/** Languages whose script is right-to-left. */
const RTL_LANGUAGES = new Set(["ar", "fa", "he", "ur"]);

function applyDirection(lng: string) {
  const baseLng = lng ? lng.split("-")[0].toLowerCase() : "en";
  const isRtl = RTL_LANGUAGES.has(baseLng);
  document.documentElement.lang = lng || "en";
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        editor: enEditor,
        settings: enSettings,
        sidebar: enSidebar,
        search: enSearch,
      },
      fa: {
        common: faCommon,
        editor: faEditor,
        settings: faSettings,
        sidebar: faSidebar,
        search: faSearch,
      },
    },
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "editor", "settings", "sidebar", "search"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "locale",
      caches: ["localStorage"],
    },
  });

// Apply direction on init and on every language change.
applyDirection(i18n.language);
i18n.on("languageChanged", applyDirection);

export default i18n;
