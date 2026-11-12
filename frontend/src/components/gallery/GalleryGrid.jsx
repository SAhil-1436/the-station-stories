import React from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../animations/ScrollReveal';

export default function GalleryGrid({ photos = [], onSelectPhoto }) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language.startsWith('hi');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {photos.map((photo, index) => {
        const title = isHindi && photo.titleHi ? photo.titleHi : photo.titleEn;
        const desc = isHindi && photo.descHi ? photo.descHi : photo.descEn;

        return (
          <ScrollReveal key={photo.id} delay={(index % 3) * 0.1}>
            <div
              onClick={() => onSelectPhoto(index)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer bg-white border border-gold/30 hover:border-plum-royal/40 shadow-soft hover:shadow-luxury hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Container */}
              <div className="aspect-[4/3] overflow-hidden bg-lavender-100 relative">
                <img
                  src={photo.imageUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                  loading="lazy"
                />
                
                {/* Expand Overlay Icon */}
                <div className="absolute inset-0 bg-plum-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-3 rounded-full bg-ivory text-plum-royal shadow-luxury">
                    <Maximize2 className="w-5 h-5 text-plum-royal" />
                  </div>
                </div>

                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-ivory/95 backdrop-blur-xs text-plum-royal border border-gold/40 shadow-xs uppercase tracking-wider">
                    {photo.category}
                  </span>
                </div>
              </div>

              {/* Photo Caption Box */}
              <div className="p-5 flex items-start justify-between gap-3 bg-white">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-plum-royal group-hover:text-plum-dark transition-colors line-clamp-1">
                    {title}
                  </h3>
                  {desc && (
                    <p className="text-xs text-body-muted font-light line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  )}
                </div>

                <div className="pt-1 shrink-0 text-gold-700" title="Authentic Photo">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
