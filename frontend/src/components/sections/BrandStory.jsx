import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../animations/ScrollReveal';

export default function BrandStory() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-lavender-50/60 border-y border-gold/20">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 xl:gap-16 2xl:gap-20 items-center">
          {/* Left: Asymmetrical Image Showcase (5 cols) */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <ScrollReveal direction="right">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="rounded-[2.5rem] overflow-hidden p-2.5 sm:p-3 bg-gradient-to-tr from-gold/40 via-lavender-200 to-plum-royal/30 shadow-luxury">
                  <div className="aspect-[4/4.5] rounded-[2rem] overflow-hidden bg-plum-dark">
                    <img
                      src="/images/branding/station-stories-signage.jpeg"
                      alt="The Station Stories Official Wall Signage"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Floating Authentic Architectural Caption */}
                <div className="absolute -bottom-6 -right-4 sm:-right-6 p-4 rounded-2xl bg-ivory border border-gold/40 shadow-luxury max-w-[220px]">
                  <p className="text-[11px] font-mono font-bold text-plum-royal">
                    OFFICIAL SIGNAGE
                  </p>
                  <p className="text-[11px] text-body-muted font-light leading-snug">
                    Original railway brickwork emblem at reception.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Narrative Story & Philosophy (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left order-1 lg:order-2">
            <ScrollReveal direction="left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-lavender-200 text-plum-royal border border-gold/30">
                <Compass className="w-3.5 h-3.5 text-gold-700" />
                <span>Our Heritage & Spirit</span>
              </span>

              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-plum-royal tracking-tight leading-[1.15] mt-4">
                Where Timeless Railway Nostalgia Meets Culinary Passion
              </h2>

              <p className="text-body text-base sm:text-lg font-light leading-relaxed mt-4">
                Inspired by the golden era of grand locomotive voyages, <strong>The Station Stories</strong> was created as a sanctuary where friends, students, and families gather over unforgettable meals.
              </p>

              <p className="text-body text-sm sm:text-base font-light leading-relaxed mt-3">
                From handcrafted burgers with secret railway sauces to stone-baked gourmet pizzas, authentic wok-tossed noodles, and soothing terracotta kulhad chai, every recipe is crafted to turn ordinary dining into an extraordinary memory.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold bg-plum-royal text-ivory hover:bg-plum-dark transition-all shadow-luxury"
                >
                  <span>{t('story.learnMore')}</span>
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
        </div>
      </div>
    </section>
  );
}
