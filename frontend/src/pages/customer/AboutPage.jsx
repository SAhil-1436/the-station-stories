import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  UtensilsCrossed, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  Clock, 
  Coffee, 
  ArrowRight 
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="py-12 min-h-screen bg-charcoal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Section 1: Hero Story Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-500 font-semibold">
            {t('brand.name')}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ivory-100">
            {t('about.title')}
          </h1>
          <p className="text-ivory-200/80 text-base sm:text-lg font-light leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Section 2: Narrative with Authentic Signage Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-950 border border-gold-500/30 text-gold-400 text-xs font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>Vintage Locomotive Heritage</span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ivory-100 leading-snug">
              A Symphony of Railway Nostalgia & Contemporary Culinary Craft
            </h2>

            <p className="text-sm sm:text-base text-ivory-200/80 font-light leading-relaxed">
              Inspired by the romantic era of grand railway journeys, <strong>The Station Stories</strong> was conceived as a destination where every visit feels like embarking on a memorable voyage. 
            </p>

            <p className="text-sm sm:text-base text-ivory-200/80 font-light leading-relaxed">
              From our handcrafted burgers and artisanal pizzas to authentic wok-tossed noodles and soothing kulhad chai, our kitchen celebrates the rich flavours that bring friends, students, and families together.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 transition-colors shadow-md"
              >
                <span>{t('hero.exploreMenu')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold border border-gold-500/40 text-gold-400 hover:bg-plum-900 transition-colors"
              >
                <span>{t('hero.viewGallery')}</span>
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-gold-500/30 shadow-2xl bg-plum-950/60 p-2">
            <img
              src="/images/branding/station-stories-signage.jpeg"
              alt="The Station Stories Brand Signage"
              className="w-full h-[420px] object-cover rounded-xl"
            />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-plum-950/90 backdrop-blur-md border border-gold-500/20 text-xs text-gold-400 font-mono">
              The Station Stories Official Wall Emblem & Signage
            </div>
          </div>
        </div>

        {/* Section 3: The 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="p-8 rounded-2xl bg-plum-950/60 border border-gold-500/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-plum-900 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-ivory-100">
              {t('about.missionTitle')}
            </h3>
            <p className="text-sm text-ivory-200/75 font-light leading-relaxed">
              {t('about.missionText')}
            </p>
          </div>

          {/* Private Cabins */}
          <div className="p-8 rounded-2xl bg-plum-950/60 border border-gold-500/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-plum-900 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-ivory-100">
              {t('about.cabinsTitle')}
            </h3>
            <p className="text-sm text-ivory-200/75 font-light leading-relaxed">
              {t('about.cabinsText')}
            </p>
          </div>

          {/* Ambiance */}
          <div className="p-8 rounded-2xl bg-plum-950/60 border border-gold-500/20 space-y-4">
            <div className="w-12 h-12 rounded-full bg-plum-900 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-ivory-100">
              {t('about.ambianceTitle')}
            </h3>
            <p className="text-sm text-ivory-200/75 font-light leading-relaxed">
              {t('about.ambianceText')}
            </p>
          </div>
        </div>

        {/* Section 4: Architectural Showcase (Dual Photos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-plum-950/40 p-8 rounded-3xl border border-gold-500/20">
          <div className="h-80 rounded-2xl overflow-hidden border border-gold-500/20 shadow-lg">
            <img
              src="/images/restaurant/seating-swing-corner.jpeg"
              alt="Cozy Swing Corner"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-80 rounded-2xl overflow-hidden border border-gold-500/20 shadow-lg">
            <img
              src="/images/restaurant/lighting-purple-chandelier.jpeg"
              alt="Atmospheric Chandelier Ambiance"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
