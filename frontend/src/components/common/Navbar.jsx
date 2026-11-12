import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  UtensilsCrossed, 
  Menu as MenuIcon, 
  X, 
  BookOpen, 
  QrCode, 
  Image as ImageIcon, 
  Compass, 
  PhoneCall, 
  Sparkles 
} from 'lucide-react';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: Compass },
    { path: '/menu', label: t('nav.menu'), icon: BookOpen },
    { path: '/qr-menu', label: t('nav.qrMenu'), icon: QrCode, highlight: true },
    { path: '/gallery', label: t('nav.gallery'), icon: ImageIcon },
    { path: '/about', label: t('nav.about'), icon: Sparkles },
    { path: '/contact', label: t('nav.contact'), icon: PhoneCall },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-plum-950/95 backdrop-blur-md border-b border-gold-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link 
          to="/" 
          onClick={closeMenu}
          className="flex items-center gap-3.5 group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gold-500/60 flex items-center justify-center bg-plum-900 group-hover:border-gold-400 group-hover:bg-plum-800 transition-all shadow-md">
            <UtensilsCrossed className="w-6 h-6 text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl sm:text-2xl text-ivory-100 tracking-wider group-hover:text-gold-400 transition-colors">
              THE STATION STORIES
            </span>
            <span className="text-[11px] text-gold-500 font-medium tracking-[0.2em] uppercase">
              Fast Food & Restaurant
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    link.highlight
                      ? isActive
                        ? 'bg-gold-500 text-charcoal-950 font-semibold shadow-md'
                        : 'border border-gold-500/60 text-gold-400 hover:bg-gold-500 hover:text-charcoal-950'
                      : isActive
                      ? 'bg-plum-800 text-gold-400 border border-gold-500/30 shadow-sm'
                      : 'text-ivory-200/90 hover:text-ivory-50 hover:bg-plum-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="h-6 w-px bg-gold-500/20" />

          {/* Language Toggle */}
          <LanguageToggle />
        </div>

        {/* Mobile Actions: Language + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle className="text-[11px] px-2.5 py-1" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-ivory-100 hover:text-gold-400 hover:bg-plum-900 focus:outline-none transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-plum-950 border-b border-gold-500/30 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    link.highlight
                      ? isActive
                        ? 'bg-gold-500 text-charcoal-950 font-bold'
                        : 'border border-gold-500/60 text-gold-400 bg-plum-900/40'
                      : isActive
                      ? 'bg-plum-800 text-gold-400 border border-gold-500/30'
                      : 'text-ivory-200 hover:bg-plum-900 hover:text-ivory-100'
                  }`}
                >
                  <Icon className="w-5 h-5 text-gold-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
