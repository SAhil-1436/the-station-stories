import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Info } from 'lucide-react';

export default function MenuCard({ item, compact = false }) {
  const { t, i18n } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const isHindi = i18n.language.startsWith('hi');

  const displayName = isHindi && item.hindiName ? item.hindiName : item.name;
  const secondaryName = isHindi ? item.name : item.hindiName;

  return (
    <article className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gold/30 hover:border-plum-royal/40 shadow-soft hover:shadow-luxury hover:-translate-y-1 transition-all duration-300">
      {/* Visual Header */}
      <div className={`relative overflow-hidden bg-lavender-100 ${compact ? 'h-36' : 'h-48 sm:h-52'}`}>
        {!imageError && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-lavender-100 text-center">
            <span className="text-4xl mb-2">🍽️</span>
            <span className="font-serif text-sm font-semibold text-plum-royal line-clamp-1">{item.name}</span>
            <span className="text-[10px] text-gold-700 font-mono tracking-widest uppercase">The Station Stories</span>
          </div>
        )}

        {/* Subtle Top Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Veg Badge & Category Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Vegetarian Symbol */}
          <div 
            className="w-5 h-5 rounded border-2 border-emerald-600 bg-white flex items-center justify-center shadow-xs"
            title="100% Vegetarian"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          </div>

          {item.categoryName && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ivory/90 backdrop-blur-xs text-plum-royal border border-gold/40 shadow-xs">
              {item.categoryName}
            </span>
          )}
        </div>

        {/* Representative Image Badge (Crucial rule from IMAGE_ASSET_GUIDE.md) */}
        {!item.isOriginalImage && (
          <div className="absolute bottom-2.5 right-2.5">
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/95 backdrop-blur-md text-plum-royal border border-gold/40 shadow-xs tracking-tight"
              title="Temporary Representative Image – To be updated with authentic kitchen photo"
            >
              <Info className="w-2.5 h-2.5 text-gold-700" />
              <span>{t('menu.representativeBadge')}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal group-hover:text-plum-dark transition-colors line-clamp-1">
                {displayName}
              </h3>
              {secondaryName && (
                <p className="text-xs text-body-muted font-sans line-clamp-1">
                  {secondaryName}
                </p>
              )}
            </div>

            {/* Spice Level Indicator */}
            {item.spiceLevel > 0 && (
              <div 
                className="flex items-center gap-0.5 text-rose-muted pt-1 shrink-0" 
                title={`Spice Level: ${item.spiceLevel}/3`}
              >
                {[...Array(item.spiceLevel)].map((_, i) => (
                  <Flame key={i} className="w-3.5 h-3.5 fill-current text-rose-muted" />
                ))}
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-body-muted font-light leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Card Price Line */}
        <div className="pt-3 border-t border-lavender-200/80 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gold-700 font-serif font-semibold">₹</span>
            <span className="text-xl font-bold font-serif text-plum-royal tracking-tight">
              {Number(item.price).toFixed(0)}
            </span>
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-lavender-100 text-plum-royal font-mono">
            Dine-In & Takeaway
          </span>
        </div>
      </div>
    </article>
  );
}
