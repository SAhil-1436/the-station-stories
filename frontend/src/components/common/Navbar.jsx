import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu as MenuIcon, 
  X, 
  BookOpen, 
  Image as ImageIcon, 
  Sparkles, 
  PhoneCall, 
  Compass 
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: Compass },
    { path: '/menu', label: t('nav.menu'), icon: BookOpen },
    { path: '/gallery', label: t('nav.gallery'), icon: ImageIcon },
    { path: '/about', label: t('nav.about'), icon: Sparkles },
    { path: '/contact', label: t('nav.contact'), icon: PhoneCall },
  ];

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-ivory/95 backdrop-blur-md shadow-soft border-b border-gold/30 py-2.5' 
          : 'bg-ivory border-b border-gold/20 py-4'
      }`}
    >
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <BrandLogo onClick={() => setIsMobileMenuOpen(false)} />

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          <nav className="flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-plum-royal text-ivory shadow-sm'
                      : 'text-body hover:text-plum-royal hover:bg-lavender-100/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>

        {/* Mobile Actions: Language + Hamburger Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3 lg:hidden shrink-0">
          <LanguageSwitcher />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="p-1.5 sm:p-2 rounded-full bg-lavender-100 text-plum-royal hover:bg-lavender-200 focus:outline-none transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-ivory border-b border-gold/30 px-5 pt-3 pb-6 shadow-luxury animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-plum-royal text-ivory shadow-sm'
                      : 'text-body hover:bg-lavender-100 text-plum-royal'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-gold-300' : 'text-plum-royal/80'}`} />
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
