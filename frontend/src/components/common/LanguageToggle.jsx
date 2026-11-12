import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang.startsWith('hi') ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-gold-500/50 bg-plum-950/60 text-gold-400 hover:text-ivory-100 hover:border-gold-400 hover:bg-plum-900 transition-all shadow-sm ${className}`}
      title={currentLang.startsWith('hi') ? 'Switch to English' : 'हिंदी में बदलें'}
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-gold-500" />
      <span className="tracking-wide">{currentLang.startsWith('hi') ? 'English' : 'हिंदी'}</span>
    </button>
  );
}
