import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  UtensilsCrossed, 
  MapPin, 
  Clock, 
  Phone, 
  Instagram, 
  Shield, 
  Heart,
  ExternalLink 
} from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-plum-950 border-t border-gold-500/20 text-ivory-200">
      {/* Upper Footer: Brand, Hours, Contact, Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold-500/60 flex items-center justify-center bg-plum-900">
                <UtensilsCrossed className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-ivory-100 tracking-wider">
                  THE STATION STORIES
                </h3>
                <p className="text-[10px] text-gold-500 font-medium tracking-widest uppercase">
                  Fast Food & Restaurant
                </p>
              </div>
            </div>
            <p className="text-sm text-ivory-200/80 leading-relaxed font-light">
              {t('brand.storyShort')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-plum-900 border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-ivory-100 hover:border-gold-400 transition-colors"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <span className="text-xs text-gold-500/90 font-mono tracking-wider">
                @thestationstories
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-base text-gold-400 uppercase tracking-widest text-xs">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-gold-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-gold-400 transition-colors">
                  {t('nav.menu')}
                </Link>
              </li>
              <li>
                <Link to="/qr-menu" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span>{t('nav.qrMenu')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">Dine-In</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-gold-400 transition-colors">
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Timings & Experience */}
          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-base text-gold-400 uppercase tracking-widest text-xs">
              {t('contact.hoursTitle')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-ivory-100">Everyday Operating Hours</p>
                  <p className="text-xs text-ivory-200/70">11:00 AM – 11:00 PM</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-plum-900/60 border border-gold-500/20 text-xs space-y-1">
                <p className="font-semibold text-gold-400">Private Dining Cabins</p>
                <p className="text-ivory-200/80 leading-relaxed">
                  Celebrate birthdays and gatherings in our private Express Cabins (Cabin 1, 2 & 3).
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Location & Inquiries */}
          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-base text-gold-400 uppercase tracking-widest text-xs">
              {t('contact.addressTitle')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 mt-1 shrink-0" />
                <p className="text-xs text-ivory-200/80 leading-relaxed">
                  {t('contact.addressPlaceholder')}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 mt-1 shrink-0" />
                <p className="text-xs text-ivory-200/80">
                  {t('contact.phonePlaceholder')}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gold-500 text-charcoal-950 hover:bg-gold-400 transition-colors shadow-md"
                >
                  <span>{t('contact.title')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Bar: Copyright, Disclaimers, Discreet Staff Link */}
      <div className="border-t border-plum-900 bg-plum-950/80 py-6 text-xs text-ivory-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} The Station Stories.</span>
            <span>{t('footer.rights')}</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-ivory-200/50 max-w-md">
            {t('footer.disclaimer')}
          </div>

          {/* Discreet Staff Portal Link */}
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-ivory-200/40 hover:text-gold-400 transition-colors"
            title="Authorized Restaurant Staff Portal"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('nav.staffLogin')}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
