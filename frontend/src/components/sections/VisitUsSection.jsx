import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  CalendarDays, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';
import SectionHeading from './SectionHeading';
import ScrollReveal from '../animations/ScrollReveal';

export default function VisitUsSection() {
  const { t } = useTranslation();

  const whatsappNumber = '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello The Station Stories, I would like to inquire about dine-in and reservations.')}`;

  return (
    <section className="py-20 lg:py-28 bg-lavender-50/70 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Hospitality & Hours"
            title="Plan Your Visit to The Station Stories"
            subtitle="Whether it is an intimate family meal, friends reunion, or celebration in our private Express Cabins, we look forward to welcoming you."
          />
        </ScrollReveal>

        {/* 3-Card Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Hours */}
          <ScrollReveal delay={0.1}>
            <div className="h-full p-8 rounded-3xl bg-white border border-gold/30 shadow-soft flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal">
                  <Clock className="w-6 h-6 text-plum-royal" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-plum-royal">
                  {t('contact.hoursTitle')}
                </h3>
                <p className="text-sm text-body-muted font-light leading-relaxed">
                  Open 7 days a week for lunch, evening snacks, and late dinner.
                </p>
                <div className="p-3.5 rounded-xl bg-ivory border border-gold/20 text-xs font-mono text-plum-royal font-bold">
                  11:00 AM – 11:00 PM Every Day
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Address & Location */}
          <ScrollReveal delay={0.2}>
            <div className="h-full p-8 rounded-3xl bg-white border border-gold/30 shadow-soft flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal">
                  <MapPin className="w-6 h-6 text-plum-royal" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-plum-royal">
                  {t('contact.addressTitle')}
                </h3>
                <p className="text-sm text-body-muted font-light leading-relaxed">
                  {t('contact.addressPlaceholder')}
                </p>
                <p className="text-xs text-body-muted/70 font-mono">
                  Coordinates & directions available on request.
                </p>
              </div>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-plum-royal hover:text-gold-700 transition-colors"
              >
                <span>View Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>

          {/* Card 3: Direct Connect & Inquiries */}
          <ScrollReveal delay={0.3}>
            <div className="h-full p-8 rounded-3xl bg-white border border-gold/30 shadow-soft flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal">
                  <MessageCircle className="w-6 h-6 text-plum-royal" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-plum-royal">
                  {t('contact.whatsappTitle')}
                </h3>
                <p className="text-sm text-body-muted font-light leading-relaxed">
                  Direct instant messaging for menu inquiries, private cabin bookings, and party reservations.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold bg-[#25D366] text-white hover:brightness-105 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{t('contact.whatsappButton')}</span>
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold bg-plum-royal text-ivory hover:bg-plum-dark transition-all shadow-sm"
                >
                  <span>{t('contact.title')}</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
