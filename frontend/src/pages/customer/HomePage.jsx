import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, ArrowRight, Maximize2 } from 'lucide-react';
import HeroSection from '../../components/hero/HeroSection';
import ExperienceHighlights from '../../components/sections/ExperienceHighlights';
import BrandStory from '../../components/sections/BrandStory';
import FeaturedMenu from '../../components/menu/FeaturedMenu';
import VisitUsSection from '../../components/sections/VisitUsSection';
import SectionHeading from '../../components/sections/SectionHeading';
import ScrollReveal from '../../components/animations/ScrollReveal';
import Lightbox from '../../components/gallery/Lightbox';
import { GALLERY_PHOTOS } from '../../data/galleryData';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isHindi = i18n.language.startsWith('hi');

  // Top 6 preview photos for homepage
  const previewPhotos = GALLERY_PHOTOS.slice(0, 6);

  return (
    <div className="flex flex-col bg-ivory">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Experience Highlights (4 Pillars) */}
      <ExperienceHighlights />

      {/* 3. Brand Story Narrative */}
      <BrandStory />

      {/* 4. Featured Menu Highlights */}
      <FeaturedMenu />

      {/* 5. Authentic Ambience Photo Showcase */}
      <section className="py-20 lg:py-28 bg-ivory border-t border-gold/20">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
              <SectionHeading
                align="left"
                badge={t('gallery.badge')}
                title={t('gallery.title')}
                subtitle={t('gallery.subtitle')}
                className="mx-0"
              />

              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-plum-royal text-ivory hover:bg-plum-dark transition-all shadow-sm shrink-0"
              >
                <span>{t('hero.viewGallery')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
              </Link>
            </div>
          </ScrollReveal>

          {/* 6-Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            {previewPhotos.map((photo, index) => {
              const title = isHindi && photo.titleHi ? photo.titleHi : photo.titleEn;
              return (
                <ScrollReveal key={photo.id} delay={index * 0.08}>
                  <div
                    onClick={() => setLightboxIndex(index)}
                    className="group relative h-56 sm:h-64 md:h-72 xl:h-80 2xl:h-[22rem] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bg-lavender-100 border border-gold/30 hover:border-plum-royal shadow-soft hover:shadow-luxury hover:-translate-y-1 transition-all duration-300"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/95 via-plum-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3.5 sm:p-4 flex flex-col justify-end text-ivory">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                        {photo.category}
                      </span>
                      <p className="font-serif font-bold text-xs sm:text-sm line-clamp-1">
                        {title}
                      </p>
                    </div>

                    {/* Expand icon */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-ivory text-plum-royal opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Plan Your Visit / Inquiries */}
      <VisitUsSection />

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={previewPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % previewPhotos.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + previewPhotos.length) % previewPhotos.length)}
        />
      )}
    </div>
  );
}
