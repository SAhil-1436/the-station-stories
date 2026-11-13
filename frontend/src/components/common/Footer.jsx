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
  ArrowUpRight 
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-plum-dark text-ivory/90 border-t border-gold/30">
      {/* Upper Content Grid */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-5">
            <BrandLogo inverted={true} />
            <p className="text-sm text-ivory/80 leading-relaxed font-light">
              {t('brand.storyShort')}
            </p>
            <div className="pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800/80 border border-gold/40 text-xs text-gold-300 hover:text-ivory hover:border-gold transition-colors"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@thestationstories</span>
                <ArrowUpRight className="w-3 h-3 text-gold-400" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-lg text-gold tracking-wide uppercase text-xs">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-ivory/80 hover:text-gold transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-ivory/80 hover:text-gold transition-colors">
                  {t('nav.menu')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-ivory/80 hover:text-gold transition-colors">
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-ivory/80 hover:text-gold transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-ivory/80 hover:text-gold transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Private Cabins */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-lg text-gold tracking-wide uppercase text-xs">
              {t('contact.hoursTitle')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-ivory">Daily Operating Hours</p>
                  <p className="text-xs text-ivory/70">11:00 AM – 11:00 PM</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-plum-800/50 border border-gold/20 text-xs space-y-1">
                <p className="font-serif font-semibold text-gold-300 text-sm">Private Express Cabins</p>
                <p className="text-ivory/80 leading-relaxed font-light">
                  Celebrate special occasions in our private Express Cabins (Cabin 1, 2 & 3). Inquire in advance.
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Inquiries */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-lg text-gold tracking-wide uppercase text-xs">
              {t('contact.addressTitle')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold mt-1 shrink-0" />
                <p className="text-xs text-ivory/80 leading-relaxed">
                  {t('contact.addressPlaceholder')}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold mt-1 shrink-0" />
                <p className="text-xs text-ivory/80">
                  {t('contact.phonePlaceholder')}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-gold text-plum-dark hover:bg-gold-light transition-all shadow-sm"
                >
                  <span>{t('contact.title')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Disclaimers, Discreet Staff Link */}
      <div className="border-t border-plum-800/80 bg-plum-950 py-6 text-xs text-ivory/60">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} The Station Stories. {t('footer.rights')}
          </p>

          <p className="text-center text-[11px] text-ivory/50 max-w-md">
            {t('footer.disclaimer')}
          </p>

          {/* Discreet Staff Portal Link */}
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-ivory/40 hover:text-gold transition-colors"
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
