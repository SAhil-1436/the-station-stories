import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FloatingWhatsApp() {
  const { t, i18n } = useTranslation();
  const whatsappNumber = '919876543210'; // Configurable WhatsApp
  const greeting = i18n.language.startsWith('hi')
    ? encodeURIComponent('नमस्ते द स्टेशन स्टोरीज़, मैं मेन्यू और डाइन-इन के बारे में जानना चाहता हूँ।')
    : encodeURIComponent('Hello The Station Stories, I would like to inquire about dine-in and menu.');
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${greeting}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
      <span className="hidden md:inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-charcoal-900/90 text-ivory-100 border border-gold-500/40 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {t('contact.whatsappButton')}
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with The Station Stories"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200"
      >
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </aside>
  );
}
