import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  UtensilsCrossed, 
  Sparkles, 
  HeartHandshake, 
  Clock, 
  Coffee, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import SectionHeading from '../../components/sections/SectionHeading';
import ScrollReveal from '../../components/animations/ScrollReveal';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="py-12 lg:py-20 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 lg:space-y-28">
        {/* Section 1: Editorial Hero Story */}
        <ScrollReveal>
          <SectionHeading
            badge="Our Heritage & Philosophy"
            title={t('about.title')}
            subtitle={t('about.subtitle')}
          />
        </ScrollReveal>

        {/* Section 2: Narrative with Authentic Signage Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <ScrollReveal direction="left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-lavender-200 text-plum-royal border border-gold/30">
                <Compass className="w-3.5 h-3.5 text-gold-700" />
                <span>The Locomotive Vision</span>
              </span>

              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-plum-royal leading-[1.14] mt-4">
                A Symphony of Railway Romance & Artisanal Food Craft
              </h2>

              <p className="text-body text-base sm:text-lg font-light leading-relaxed mt-4">
                Inspired by the nostalgic magic of Indian railway journeys, <strong>The Station Stories</strong> was born to provide an ambiance where every arrival feels like a celebration.
              </p>

              <p className="text-body text-sm sm:text-base font-light leading-relaxed mt-3">
                Whether you step in for our signature Station Veg Burgers, authentic stone-baked pizzas, spicy wok-tossed Hakka noodles, or steaming kulhad chai, every meal is prepared with fresh ingredients, balanced spices, and heartfelt hospitality.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold bg-plum-royal text-ivory hover:bg-plum-dark transition-all shadow-luxury"
                >
                  <span>{t('hero.exploreMenu')}</span>
                  <ArrowRight className="w-4 h-4 text-gold-300" />
                </Link>

                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold border-2 border-plum-royal/30 text-plum-royal hover:bg-lavender-200 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-gold-700" />
                  <span>View Photo Gallery</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Image: Official Signage */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="right">
              <div className="rounded-[2.5rem] overflow-hidden p-3 bg-gradient-to-tr from-gold/40 via-lavender-200 to-plum-royal/20 shadow-luxury">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-plum-dark">
                  <img
                    src="/images/branding/station-stories-signage.jpeg"
                    alt="The Station Stories Official Wall Signage"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-xs font-mono text-gold-700">
                Official illuminated brand signage at reception
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Section 3: The 3 Core Pillars in Soft Lavender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <ScrollReveal delay={0.1}>
            <div className="h-full p-8 rounded-3xl bg-lavender-50 border border-gold/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-lavender-200 border border-gold/40 flex items-center justify-center text-plum-royal">
                <UtensilsCrossed className="w-6 h-6 text-plum-royal" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-plum-royal">
                {t('about.missionTitle')}
              </h3>
              <p className="text-sm text-body-muted font-light leading-relaxed">
                {t('about.missionText')}
              </p>
            </div>
          </ScrollReveal>

          {/* Private Cabins */}
          <ScrollReveal delay={0.2}>
            <div className="h-full p-8 rounded-3xl bg-lavender-50 border border-gold/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-lavender-200 border border-gold/40 flex items-center justify-center text-plum-royal">
                <HeartHandshake className="w-6 h-6 text-plum-royal" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-plum-royal">
                {t('about.cabinsTitle')}
              </h3>
              <p className="text-sm text-body-muted font-light leading-relaxed">
                {t('about.cabinsText')}
              </p>
            </div>
          </ScrollReveal>

          {/* Ambiance */}
          <ScrollReveal delay={0.3}>
            <div className="h-full p-8 rounded-3xl bg-lavender-50 border border-gold/30 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-lavender-200 border border-gold/40 flex items-center justify-center text-plum-royal">
                <Sparkles className="w-6 h-6 text-plum-royal" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-plum-royal">
                {t('about.ambianceTitle')}
              </h3>
              <p className="text-sm text-body-muted font-light leading-relaxed">
                {t('about.ambianceText')}
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Section 4: Dual Architectural Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <ScrollReveal delay={0.1}>
            <div className="rounded-3xl overflow-hidden border border-gold/30 shadow-luxury h-80 sm:h-96">
              <img
                src="/images/restaurant/seating-swing-corner.jpeg"
                alt="Cozy Rattan Swing Corner"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <p className="mt-3 text-xs font-mono text-body-muted text-center">
              Cozy rattan hanging swing pod against neon glass partitions
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="rounded-3xl overflow-hidden border border-gold/30 shadow-luxury h-80 sm:h-96">
              <img
                src="/images/restaurant/lighting-purple-chandelier.jpeg"
                alt="Atmospheric Crystal Chandelier"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <p className="mt-3 text-xs font-mono text-body-muted text-center">
              Crystal chandelier illumination & evening ambiance
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
