import React from 'react';
import { useTranslation } from 'react-i18next';
import { RESTAURANT_INFO } from '../../data/restaurantData';
import SectionHeading from './SectionHeading';
import ScrollReveal from '../animations/ScrollReveal';

export default function ExperienceHighlights() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language.startsWith('hi');

  return (
    <section className="py-20 lg:py-28 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge={t('story.badge')}
            title={t('story.title')}
            subtitle={t('story.lead')}
          />
        </ScrollReveal>

        {/* 4 Pillars Grid in Soft Lavender & Royal Plum */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {RESTAURANT_INFO.highlights.map((item, index) => {
            const title = isHindi ? item.titleHi : item.titleEn;
            const desc = isHindi ? item.descHi : item.descEn;

            return (
              <ScrollReveal key={item.id} delay={index * 0.1}>
                <div className="h-full flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-lavender-50 border border-gold/30 shadow-soft hover:shadow-luxury hover:-translate-y-1 transition-all duration-300 group">
                  <div>
                    {/* Image Frame */}
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-lavender-200">
                      <img
                        src={item.image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    <h3 className="font-serif font-bold text-xl text-plum-royal group-hover:text-plum-dark transition-colors">
                      {title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-body-muted font-light leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gold/20 flex items-center justify-between text-[11px] font-mono text-gold-700">
                    <span>THE STATION STORIES</span>
                    <span>AUTHENTIC AMBIENCE</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
