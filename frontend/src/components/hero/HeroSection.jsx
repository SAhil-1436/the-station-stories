import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative bg-ivory pt-8 pb-16 lg:pt-14 lg:pb-20 xl:pb-24 border-b border-gold/20">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 2xl:gap-14 items-center">
          {/* Left Column: Brand Typography & CTAs (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 xl:space-y-8 text-center lg:text-left">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lavender-100 border border-gold/40 text-plum-royal text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t('hero.openNow')} • 11:00 AM – 11:00 PM</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2.5 sm:space-y-4">
              <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-[0.16em] sm:tracking-[0.28em] text-gold-700 font-bold">
                Railway Ambiance & Artisanal Fast Food
              </span>
              <h1 className="font-serif font-extrabold text-[1.5rem] sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.65rem] text-plum-royal tracking-tight leading-[1.15] sm:leading-[1.12]">
                <span className="block">{t('hero.titlePart1')}</span>
                <span className="italic font-normal block text-gold-700 mt-0.5 sm:mt-1.5 break-words xl:whitespace-nowrap">
                  {t('hero.titlePart2')}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-body text-sm sm:text-base md:text-lg xl:text-xl font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
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
            <div className="pt-3 sm:pt-4 flex items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs text-body-muted font-mono text-center lg:text-left">
              <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" />
              <span>Authentic Interior Architecture & Photography</span>
            </div>
          </div>

          {/* Right Column: Authentic Restaurant Photography Editorial Showcase (5 cols on desktop) */}
          <div className="lg:col-span-5 relative py-4 lg:py-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Asymmetrical Frame in Champagne Gold */}
              <div className="relative rounded-[2.5rem] p-2.5 sm:p-3 bg-gradient-to-br from-gold/40 via-lavender-200 to-plum-royal/20 shadow-luxury">
                <div className="relative aspect-[4/4] rounded-[2rem] overflow-hidden bg-plum-dark">
                  <img
                    src="/images/restaurant/interior-main-hall.jpeg"
                    alt="The Station Stories Central Express Dining Hall"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  {/* Subtle Plum Gradient Overlay at base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/85 via-plum-dark/20 to-transparent pointer-events-none" />

                  {/* Caption on image */}
                  <div className="absolute bottom-5 left-5 right-5 text-ivory text-xs space-y-1">
                    <p className="font-serif font-bold text-base text-gold-300">Central Express Hall</p>
                    <p className="font-light text-ivory/80 text-[11px]">Warm golden station lighting and comfortable booths.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
