import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
  counts = {}
}) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language.startsWith('hi');

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
      {/* "All" Option */}
      <button
        role="tab"
        aria-selected={selectedCategory === null}
        onClick={() => onSelectCategory(null)}
        className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
          selectedCategory === null
            ? 'bg-plum-royal text-ivory shadow-sm'
            : 'bg-white text-plum-royal/80 hover:text-plum-royal hover:bg-lavender-100 border border-gold/30'
        }`}
      >
        {t('menu.all')} {counts.all !== undefined && `(${counts.all})`}
      </button>

      {/* Category List */}
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const title = isHindi && cat.nameHi ? cat.nameHi : (cat.nameEn || cat.name);
        const count = counts[cat.id];

        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              isSelected
                ? 'bg-plum-royal text-ivory shadow-sm'
                : 'bg-white text-plum-royal/80 hover:text-plum-royal hover:bg-lavender-100 border border-gold/30'
            }`}
          >
            {title} {count !== undefined && `(${count})`}
          </button>
        );
      })}
    </div>
  );
}
