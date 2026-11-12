import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, ShieldCheck } from 'lucide-react';
import { GALLERY_CATEGORIES, GALLERY_PHOTOS } from '../../data/galleryData';
import GalleryGrid from '../../components/gallery/GalleryGrid';
import Lightbox from '../../components/gallery/Lightbox';
import SectionHeading from '../../components/sections/SectionHeading';
import ScrollReveal from '../../components/animations/ScrollReveal';

export default function GalleryPage() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isHindi = i18n.language.startsWith('hi');

  const filteredPhotos = GALLERY_PHOTOS.filter((photo) => {
    if (activeCategory === 'ALL') return true;
    return photo.category === activeCategory;
  });

  return (
    <div className="py-12 lg:py-20 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <ScrollReveal>
          <SectionHeading
            badge={t('gallery.badge')}
            title={t('gallery.title')}
            subtitle={t('gallery.subtitle')}
          />

          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-gold-700 text-center">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>100% Authentic Restaurant Architecture & Interior Photography</span>
          </div>
        </ScrollReveal>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2" role="tablist">
          {GALLERY_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.key;
            const title = isHindi ? cat.nameHi : cat.nameEn;

            return (
              <button
                key={cat.key}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-plum-royal text-ivory shadow-sm'
                    : 'bg-white text-plum-royal/80 hover:text-plum-royal hover:bg-lavender-100 border border-gold/30'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <GalleryGrid
          photos={filteredPhotos}
          onSelectPhoto={(idx) => setLightboxIndex(idx)}
        />
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)}
        />
      )}
    </div>
  );
}
