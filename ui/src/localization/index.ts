import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import ta from './ta.json';

const resources = {
  en: { translation: en },
  ta: { translation: ta }
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources,
      lng: Localization.getLocales()[0]?.languageCode === 'ta' ? 'ta' : 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false }
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.warn('i18n init failed', error);
    });
}

export default i18n;
