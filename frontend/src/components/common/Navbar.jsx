import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UtensilsCrossed, Monitor, ShieldCheck, Home } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/pos', label: t('nav.pos'), icon: Monitor },
    { path: '/admin', label: t('nav.admin'), icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-charcoal-900/90 backdrop-blur-md border-b border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full border border-gold-600/50 flex items-center justify-center bg-charcoal-800 group-hover:border-gold-500 transition-colors">
            <UtensilsCrossed className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-ivory-50 tracking-wider group-hover:text-gold-500 transition-colors">
              THE STATION STORIES
            </span>
            <span className="hidden sm:block text-[10px] text-gold-600 font-medium tracking-widest uppercase">
              Fast Food & Restaurant
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gold-600/20 text-gold-500 border border-gold-600/30'
                      : 'text-gray-300 hover:text-ivory-50 hover:bg-charcoal-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="h-4 w-px bg-charcoal-700 mx-1" />

          {/* Language Switcher */}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
