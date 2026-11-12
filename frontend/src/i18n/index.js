import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      brand: {
        name: 'The Station Stories',
        tagline: 'Fast Food & Restaurant',
      },
      nav: {
        home: 'Home',
        menu: 'Menu',
        gallery: 'Gallery',
        about: 'About Us',
        contact: 'Contact',
        pos: 'POS Billing',
        admin: 'Admin Portal',
      },
      devStatus: {
        title: 'Phase 1 Environment & Diagnostics',
        backendStatus: 'Backend Status',
        connecting: 'Connecting to backend...',
        connected: 'Connected',
        disconnected: 'Disconnected',
        database: 'Database',
        phase: 'Current Phase',
        version: 'API Version',
        uptimeNotice: 'Backend health check active at GET /api/health',
      },
      common: {
        loading: 'Loading...',
        switchLanguage: 'हिंदी',
      },
    },
  },
  hi: {
    translation: {
      brand: {
        name: 'द स्टेशन स्टोरीज़',
        tagline: 'फास्ट फूड और रेस्टोरेंट',
      },
      nav: {
        home: 'होम',
        menu: 'मेन्यू',
        gallery: 'गैलरी',
        about: 'हमारे बारे में',
        contact: 'संपर्क करें',
        pos: 'पीओएस बिलिंग',
        admin: 'एडमिन पोर्टल',
      },
      devStatus: {
        title: 'चरण 1 वातावरण और निदान',
        backendStatus: 'बैकएंड स्थिति',
        connecting: 'बैकएंड से जुड़ रहा है...',
        connected: 'जुड़ा हुआ है',
        disconnected: 'डिस्कनेक्ट',
        database: 'डेटाबेस',
        phase: 'वर्तमान चरण',
        version: 'एपीआई संस्करण',
        uptimeNotice: 'बैकएंड स्वास्थ्य जांच GET /api/health पर सक्रिय है',
      },
      common: {
        loading: 'लोड हो रहा है...',
        switchLanguage: 'English',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
