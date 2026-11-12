import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Info } from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../../data/menuData';
import MenuCard from '../../components/menu/MenuCard';
import CategoryFilter from '../../components/menu/CategoryFilter';
import SectionHeading from '../../components/sections/SectionHeading';
import EmptyState from '../../components/common/EmptyState';
import ScrollReveal from '../../components/animations/ScrollReveal';

export default function MenuPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Filter dishes
  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (selectedCategory !== null && item.categoryId !== selectedCategory) {
        return false;
      }
      if (isVegOnly && !item.isVeg) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchHindi = item.hindiName ? item.hindiName.includes(q) : false;
        const matchDesc = item.description.toLowerCase().includes(q);
        return matchName || matchHindi || matchDesc;
      }
      return true;
    });
  }, [selectedCategory, isVegOnly, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: MENU_ITEMS.length };
    MENU_CATEGORIES.forEach((cat) => {
      counts[cat.id] = MENU_ITEMS.filter((i) => i.categoryId === cat.id).length;
    });
    return counts;
  }, []);

  return (
    <div className="py-12 lg:py-20 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <ScrollReveal>
          <SectionHeading
            badge="Culinary Catalog"
            title={t('menu.title')}
            subtitle={t('menu.subtitle')}
          />

          {/* Representative Stock Image Notice (Mandatory from IMAGE_ASSET_GUIDE.md) */}
          <div className="mt-4 max-w-2xl mx-auto p-3.5 rounded-2xl bg-lavender-100 border border-gold/40 text-xs text-body-muted flex items-center justify-center gap-2 text-center">
            <Info className="w-4 h-4 text-gold-700 shrink-0" />
            <span>Images tagged with [Representative Image] are reference visuals during development, to be updated with live kitchen photographs before launch.</span>
          </div>
        </ScrollReveal>

        {/* Filter Controls Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-plum-royal/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('menu.searchPlaceholder')}
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-gold/40 text-body placeholder-body-muted/60 text-xs sm:text-sm focus:outline-none focus:border-plum-royal shadow-xs transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-body-muted hover:text-plum-royal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Veg Switch Filter */}
            <button
              onClick={() => setIsVegOnly(!isVegOnly)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 shadow-xs ${
                isVegOnly
                  ? 'bg-emerald-900 text-ivory border-emerald-700'
                  : 'bg-white text-plum-royal border-gold/40 hover:bg-lavender-100'
              }`}
            >
              <div className="w-4 h-4 rounded border-2 border-emerald-600 bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
              <span>{t('menu.vegOnly')}</span>
            </button>
          </div>

          {/* Category Tabs Strip */}
          <CategoryFilter
            categories={MENU_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
          />
        </div>

        {/* Dish Grid / Empty State */}
        {filteredDishes.length === 0 ? (
          <EmptyState
            title={t('menu.emptyResults')}
            message="No delicacies match your filter criteria. Try resetting your search or choosing a different category."
            actionText="Reset All Filters"
            onAction={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setIsVegOnly(false);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredDishes.map((dish, idx) => (
              <ScrollReveal key={dish.id} delay={(idx % 4) * 0.08}>
                <MenuCard item={dish} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
