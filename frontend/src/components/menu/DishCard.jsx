import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Plus, Check, Info } from 'lucide-react';

export default function DishCard({ 
  item, 
  onAddToTray, 
  isAdded = false, 
  compact = false 
}) {
  const { t, i18n } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const isHindi = i18n.language.startsWith('hi');

  const displayName = isHindi && item.hindiName ? item.hindiName : item.name;
  const secondaryName = isHindi ? item.name : item.hindiName;

  return (
    <article className="group flex flex-col bg-plum-950/70 border border-gold-500/20 hover:border-gold-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Dish Visual Header */}
      <div className={`relative overflow-hidden bg-plum-900/50 ${compact ? 'h-36' : 'h-48 sm:h-52'}`}>
        {!imageError && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-plum-900 via-plum-950 to-charcoal-950 text-center">
            <span className="text-4xl mb-2">🍽️</span>
            <span className="font-serif text-sm font-semibold text-ivory-100 line-clamp-1">{item.name}</span>
            <span className="text-[10px] text-gold-500 font-mono tracking-widest uppercase">The Station Stories</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-transparent to-black/30 pointer-events-none" />

        {/* Veg Badge & Category Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Indian Veg Icon */}
          <div 
            className="w-5 h-5 rounded border border-green-500 bg-white/95 flex items-center justify-center shadow-md"
            title="100% Vegetarian"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
          </div>

          {item.categoryName && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-plum-950/80 backdrop-blur-sm text-gold-400 border border-gold-500/30">
              {item.categoryName}
            </span>
          )}
        </div>

        {/* Representative Image Badge (Crucial rule from IMAGE_ASSET_GUIDE.md) */}
        {!item.isOriginalImage && (
          <div className="absolute bottom-2.5 right-2.5">
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-charcoal-950/85 backdrop-blur-md text-gold-400/90 border border-gold-500/30 tracking-tight"
              title="Temporary Representative Image – To be updated with authentic kitchen photo"
            >
              <Info className="w-2.5 h-2.5" />
              <span>{t('menu.representativeBadge')}</span>
            </span>
          </div>
        )}
      </div>

      {/* Dish Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-ivory-100 group-hover:text-gold-400 transition-colors line-clamp-1">
                {displayName}
              </h3>
              {secondaryName && (
                <p className="text-xs text-ivory-200/60 font-sans line-clamp-1">
                  {secondaryName}
                </p>
              )}
            </div>

            {/* Spice Level Peppers */}
            {item.spiceLevel > 0 && (
              <div 
                className="flex items-center gap-0.5 text-red-400 pt-1 shrink-0" 
                title={`Spice Level: ${item.spiceLevel}/3`}
              >
                {[...Array(item.spiceLevel)].map((_, i) => (
                  <Flame key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-ivory-200/75 font-light leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Footer: Price & Add to Tray Button */}
        <div className="pt-2 border-t border-plum-900/80 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gold-400 font-serif">₹</span>
            <span className="text-lg sm:text-xl font-bold font-serif text-ivory-100 tracking-tight">
              {Number(item.price).toFixed(0)}
            </span>
          </div>

          {onAddToTray && (
            <button
              onClick={() => onAddToTray(item)}
              aria-label={`Add ${item.name} to order`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-gold-500 hover:bg-gold-400 text-charcoal-950 active:scale-95'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('menu.addToTray')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
