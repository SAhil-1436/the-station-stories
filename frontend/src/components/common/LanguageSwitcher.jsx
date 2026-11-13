import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const isHindi = currentLang.startsWith('hi');

  return (
    <div 
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-full bg-lavender-100/70 border border-gold/30 shadow-sm shrink-0 ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
          !isHindi
            ? 'bg-plum-royal text-ivory shadow-sm'
            : 'text-plum-royal/80 hover:text-plum-royal'
        }`}
        aria-pressed={!isHindi}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold font-hindi transition-all duration-200 ${
          isHindi
            ? 'bg-plum-royal text-ivory shadow-sm'
            : 'text-plum-royal/80 hover:text-plum-royal'
        }`}
        aria-pressed={isHindi}
      >
        हिंदी
      </button>
    </div>
  );
}
