import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { MENU_ITEMS } from '../../data/menuData';
import MenuCard from './MenuCard';
import SectionHeading from '../sections/SectionHeading';
import ScrollReveal from '../animations/ScrollReveal';

export default function FeaturedMenu() {
  const { t } = useTranslation();
  const featuredDishes = MENU_ITEMS.filter(item => item.isFeatured).slice(0, 4);

  return (
    <section className="py-20 lg:py-28 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
            <SectionHeading
              align="left"
              badge={t('menu.popularBadge')}
              title={t('menu.title')}
              subtitle={t('menu.subtitle')}
              className="mx-0"
            />

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-plum-royal text-ivory hover:bg-plum-dark transition-all shadow-sm shrink-0"
            >
              <span>{t('menu.viewFullMenu')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
            </Link>
          </div>
        </ScrollReveal>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {featuredDishes.map((dish, idx) => (
            <ScrollReveal key={dish.id} delay={idx * 0.1}>
              <MenuCard item={dish} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
