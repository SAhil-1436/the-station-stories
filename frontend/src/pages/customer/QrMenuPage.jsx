import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  QrCode, 
  Search, 
  X, 
  Flame, 
  Info, 
  Compass, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../../data/menuData';

export default function QrMenuPage() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCabin, setSelectedCabin] = useState('Express Dining');
  const isHindi = i18n.language.startsWith('hi');

  const cabinLocations = [
    'Express Dining (Main Hall)',
    'Cabin 1 (Express Cabin)',
    'Cabin 2 (Royal Cabin)',
    'Cabin 3 (First Class Cabin)',
    'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
    'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10',
    'Takeaway Counter'
  ];

  // Filter items
  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (selectedCategory !== null && item.categoryId !== selectedCategory) {
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
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-ivory pb-16">
      {/* 1. Mobile-First Sticky Top Bar */}
      <div className="sticky top-16 z-30 bg-ivory/95 backdrop-blur-md border-b border-gold/30 px-4 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto space-y-2.5">
          {/* Header row: Brand & Cabin selector */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-plum-royal text-gold flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-sm text-plum-royal leading-tight">
                  The Station Stories
                </h1>
                <p className="text-[10px] text-gold-700 font-mono uppercase tracking-wider">
                  Digital QR Menu
                </p>
              </div>
            </div>

            {/* Table / Cabin Selector */}
            <select
              value={selectedCabin}
              onChange={(e) => setSelectedCabin(e.target.value)}
              aria-label="Select table or private cabin"
              className="bg-white border border-gold/40 text-plum-royal text-xs font-semibold rounded-full px-3 py-1.5 focus:outline-none focus:border-plum-royal shadow-2xs"
            >
              {cabinLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (burger, pizza, noodles, chai)..."
              className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-gold/30 text-body placeholder-body-muted/60 text-xs focus:outline-none focus:border-plum-royal transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-body-muted hover:text-plum-royal"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Category Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-plum-royal text-ivory shadow-xs'
                  : 'bg-white text-plum-royal border border-gold/30 hover:bg-lavender-100'
              }`}
            >
              All Dishes ({MENU_ITEMS.length})
            </button>

            {MENU_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const title = isHindi && cat.nameHi ? cat.nameHi : cat.nameEn;
              const count = MENU_ITEMS.filter((i) => i.categoryId === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-plum-royal text-ivory shadow-xs'
                      : 'bg-white text-plum-royal border border-gold/30 hover:bg-lavender-100'
                  }`}
                >
                  {title} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Welcome Cabin Banner */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="p-3.5 rounded-2xl bg-lavender-100/80 border border-gold/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-plum-royal shrink-0" />
            <div>
              <p className="font-bold text-plum-royal">Welcome to {selectedCabin}</p>
              <p className="text-[11px] text-body-muted font-light">Browse our menu and place your order with your table captain.</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-plum-royal text-ivory">
              Dine-In
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fast Mobile Dish List (Browsing Only) */}
      <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
        {filteredDishes.length === 0 ? (
          <div className="py-16 text-center text-body-muted text-sm space-y-2">
            <p className="font-serif text-base text-plum-royal font-bold">No dishes found</p>
            <p className="text-xs">Try selecting a different category or clearing the search box.</p>
          </div>
        ) : (
          filteredDishes.map((item) => {
            const displayName = isHindi && item.hindiName ? item.hindiName : item.name;
            const secondaryName = isHindi ? item.name : item.hindiName;

            return (
              <article
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border border-gold/30 shadow-soft flex items-center gap-3.5"
              >
                {/* Compact Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-lavender-100 shrink-0 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Veg dot */}
                  <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded border border-emerald-600 bg-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-plum-royal truncate">
                      {displayName}
                    </h3>
                    {item.spiceLevel > 0 && (
                      <div className="flex items-center text-rose-muted shrink-0">
                        {[...Array(item.spiceLevel)].map((_, i) => (
                          <Flame key={i} className="w-3 h-3 fill-current text-rose-muted" />
                        ))}
                      </div>
                    )}
                  </div>

                  {secondaryName && (
                    <p className="text-[11px] text-body-muted truncate font-sans">
                      {secondaryName}
                    </p>
                  )}

                  <p className="text-[11px] text-body-muted/80 line-clamp-2 font-light leading-snug">
                    {item.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="font-serif font-bold text-sm sm:text-base text-plum-royal">
                      ₹{Number(item.price).toFixed(0)}
                    </span>

                    <span className="text-[10px] text-emerald-800 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300">
                      Available
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 4. Bottom Table Captain Information Note */}
      <div className="max-w-2xl mx-auto px-4 pt-6 text-center text-xs text-body-muted/70 space-y-1">
        <p className="font-serif font-semibold text-plum-royal">The Station Stories Dining Experience</p>
        <p className="font-light">Please inform your service captain of any dietary preferences or allergy requirements.</p>
      </div>
    </div>
  );
}
