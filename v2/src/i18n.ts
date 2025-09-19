import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const resources = {
  en: {
    translation: {
      // English translations will be loaded from public/locales/en/
    }
  },
  ru: {
    translation: {
      // Russian translations will be loaded from public/locales/ru/
    }
  },
  de: {
    translation: {
      // German translations will be loaded from public/locales/de/
    }
  },
  pl: {
    translation: {
      // Polish translations will be loaded from public/locales/pl/
    }
  },
  cs: {
    translation: {
      // Czech translations will be loaded from public/locales/cs/
    }
  },
  be: {
    translation: {
      // Belarusian translations will be loaded from public/locales/be/
    }
  },
  uk: {
    translation: {
      // Ukrainian translations will be loaded from public/locales/uk/
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    backend: {
      loadPath: '/locales/{{lng}}/translations.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    supportedLngs: ['ru', 'en', 'de', 'pl', 'cs', 'be', 'uk'],

    load: 'languageOnly', // Remove region code (e.g., en-US -> en)
  });

export default i18n;