import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-ivory pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Brand Typography & CTAs (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lavender-100 border border-gold/40 text-plum-royal text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t('hero.openNow')} • 11:00 AM – 11:00 PM</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <span className="block text-xs font-mono uppercase tracking-[0.28em] text-gold-700 font-bold">
                Railway Ambiance & Artisanal Fast Food
              </span>
              <h1 className="font-serif font-extrabold text-4xl sm:text-6xl lg:text-7xl text-plum-royal tracking-tight leading-[1.08]">
                <span>{t('hero.titlePart1')} </span>
                <span className="italic font-normal block sm:inline text-gold-700">
                  {t('hero.titlePart2')}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-body text-base sm:text-lg lg:text-xl font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold bg-plum-royal text-ivory hover:bg-plum-dark active:scale-98 transition-all shadow-luxury hover:shadow-elevated"
              >
                <BookOpen className="w-4 h-4 text-gold-300" />
                <span>{t('hero.exploreMenu')}</span>
                <ArrowRight className="w-4 h-4 text-gold-300 ml-1" />
              </Link>

              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold border-2 border-plum-royal/30 text-plum-royal hover:bg-lavender-100 hover:border-plum-royal active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4 text-gold-700" />
                <span>View Our Story</span>
              </Link>
            </div>

            {/* Authentic Photography Trust Badge */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-2 text-xs text-body-muted font-mono">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>Authentic Interior Architecture & Photography</span>
            </div>
          </div>

          {/* Right Column: Authentic Restaurant Photography Editorial Showcase (5 cols on desktop) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Asymmetrical Frame in Champagne Gold */}
              <div className="relative rounded-[2.5rem] overflow-hidden p-2.5 bg-gradient-to-br from-gold/40 via-lavender-200 to-plum-royal/20 shadow-luxury">
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-plum-dark">
                  <img
                    src="/images/restaurant/interior-main-hall.jpeg"
                    alt="The Station Stories Central Express Dining Hall"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  {/* Subtle Plum Gradient Overlay at base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/80 via-transparent to-transparent pointer-events-none" />

                  {/* Caption on image */}
                  <div className="absolute bottom-5 left-5 right-5 text-ivory text-xs space-y-1">
                    <p className="font-serif font-bold text-base text-gold-300">Central Express Hall</p>
                    <p className="font-light text-ivory/80 text-[11px]">Warm golden station lighting and comfortable booths.</p>
                  </div>
                </div>
              </div>

              {/* Overlapping Floating Badge: Dine-In QR Quick Jump */}
              <Link
                to="/qr-menu"
                className="absolute -bottom-6 -left-4 sm:-left-6 p-4 rounded-2xl bg-ivory border-2 border-gold/40 shadow-elevated flex items-center gap-3.5 hover:scale-102 transition-transform duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-plum-royal text-gold flex items-center justify-center shadow-sm">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-plum-royal group-hover:text-gold-700 transition-colors">
                    Dine-In Table QR
                  </span>
                  <span className="block text-[11px] text-body-muted font-light">
                    Browse menu right at your table
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
