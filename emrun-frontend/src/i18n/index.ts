/**
 * i18n configuration for French localization
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    lng: 'fr',
    fallbackLng: 'fr',
    resources: {
      fr: {
        translation: fr,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
