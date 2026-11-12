import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gold-600/40 text-gold-500 hover:bg-gold-600/10 transition-colors"
      title="Switch Language / भाषा बदलें"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{i18n.language === 'hi' ? 'English' : 'हिंदी'}</span>
    </button>
  );
}
