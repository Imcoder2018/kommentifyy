import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import ur from './locales/ur';
import ar from './locales/ar';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import hi from './locales/hi';
import pt from './locales/pt';
import zh from './locales/zh';
import tr from './locales/tr';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

const resources = {
  en: { translation: en },
  ur: { translation: ur },
  ar: { translation: ar },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  hi: { translation: hi },
  pt: { translation: pt },
  zh: { translation: zh },
  tr: { translation: tr },
};

// Get saved language from localStorage (client-side only)
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dashboard-language') || 'en';
  }
  return 'en';
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: getSavedLanguage(),
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already handles escaping
      },
      react: {
        useSuspense: false,
      },
    });
}

export const getLanguageDir = (lang: string): 'ltr' | 'rtl' => {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  return (found?.dir as 'ltr' | 'rtl') || 'ltr';
};

export default i18n;
