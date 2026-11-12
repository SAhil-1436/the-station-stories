import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  BookOpen, 
  Clock, 
  Compass, 
  ShieldCheck, 
  Flame, 
  Coffee, 
  ChevronRight,
  HeartHandshake,
  Maximize2 
} from 'lucide-react';
import { getMenu, getGallery } from '../../services/api';
import DishCard from '../../components/menu/DishCard';
import GalleryLightbox from '../../components/gallery/GalleryLightbox';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    // Load top featured dishes
    getMenu().then(items => {
      if (items && items.length > 0) {
        setFeaturedDishes(items.slice(0, 4));
      }
    });

    // Load authentic gallery photos
    getGallery().then(photos => {
      if (photos && photos.length > 0) {
        setGalleryPhotos(photos.slice(0, 6));
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-plum-950">
        {/* Background Image with Deep Plum & Gold Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/restaurant/interior-main-hall.jpeg"
            alt="The Station Stories Central Dining Hall"
            className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-plum-950/95 via-plum-950/80 to-charcoal-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-plum-900/80 border border-gold-500/40 text-gold-400 text-xs sm:text-sm font-medium mb-6 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span>{t('hero.openNow')} • {t('hero.hours')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-ivory-100 tracking-tight leading-[1.15] max-w-4xl">
            <span>{t('hero.titlePart1')} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 block sm:inline">
              {t('hero.titlePart2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-ivory-200/90 max-w-2xl font-light leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Call-to-Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-charcoal-950 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-gold-500/20"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t('hero.exploreMenu')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/qr-menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-semibold border-2 border-gold-500/60 bg-plum-900/60 hover:bg-plum-900 text-gold-400 hover:text-ivory-100 hover:border-gold-400 active:scale-95 transition-all backdrop-blur-sm"
            >
              <QrCode className="w-5 h-5" />
              <span>{t('hero.tableOrder')}</span>
            </Link>
          </div>

          {/* Authentic Photo Verification Pill */}
          <div className="mt-12 inline-flex items-center gap-2 text-xs text-ivory-200/60 font-mono">
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            <span>Showcasing Authentic Restaurant Architecture & Photography</span>
          </div>
        </div>
      </section>

      {/* 2. THE JOURNEY & THE AMBIENCE (4 PILLARS) */}
      <section className="py-20 bg-charcoal-950 border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-500 font-semibold">
              {t('story.badge')}
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-ivory-100">
              {t('story.title')}
            </h2>
            <p className="text-ivory-200/80 text-sm sm:text-base font-light leading-relaxed">
              {t('story.lead')}
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Express Dining Hall */}
            <div className="p-6 rounded-2xl bg-plum-950/60 border border-gold-500/20 hover:border-gold-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-xl overflow-hidden mb-5">
                  <img
                    src="/images/restaurant/interior-dining-booths.jpeg"
                    alt="Express Dining Booths"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif font-bold text-lg text-ivory-100 group-hover:text-gold-400 transition-colors">
                  {t('story.pillar1Title')}
                </h3>
                <p className="mt-2 text-xs text-ivory-200/70 leading-relaxed font-light">
                  {t('story.pillar1Desc')}
                </p>
              </div>
            </div>

            {/* Pillar 2: Private Cabins */}
            <div className="p-6 rounded-2xl bg-plum-950/60 border border-gold-500/20 hover:border-gold-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-xl overflow-hidden mb-5">
                  <img
                    src="/images/restaurant/entrance-portal-view.jpeg"
                    alt="Private Express Cabins"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif font-bold text-lg text-ivory-100 group-hover:text-gold-400 transition-colors">
                  {t('story.pillar2Title')}
                </h3>
                <p className="mt-2 text-xs text-ivory-200/70 leading-relaxed font-light">
                  {t('story.pillar2Desc')}
                </p>
              </div>
            </div>

            {/* Pillar 3: Hanging Swing Pods */}
            <div className="p-6 rounded-2xl bg-plum-950/60 border border-gold-500/20 hover:border-gold-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-xl overflow-hidden mb-5">
                  <img
                    src="/images/restaurant/seating-swing-chair.jpeg"
                    alt="Hanging Swing Pods"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif font-bold text-lg text-ivory-100 group-hover:text-gold-400 transition-colors">
                  {t('story.pillar3Title')}
                </h3>
                <p className="mt-2 text-xs text-ivory-200/70 leading-relaxed font-light">
                  {t('story.pillar3Desc')}
                </p>
              </div>
            </div>

            {/* Pillar 4: Fresh Kitchen Craft */}
            <div className="p-6 rounded-2xl bg-plum-950/60 border border-gold-500/20 hover:border-gold-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-xl overflow-hidden mb-5">
                  <img
                    src="/images/restaurant/decor-burger-mural.jpeg"
                    alt="Fresh Kitchen Craft"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif font-bold text-lg text-ivory-100 group-hover:text-gold-400 transition-colors">
                  {t('story.pillar4Title')}
                </h3>
                <p className="mt-2 text-xs text-ivory-200/70 leading-relaxed font-light">
                  {t('story.pillar4Desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-ivory-100 transition-colors group"
            >
              <span>{t('story.learnMore')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED HANDCRAFTED DISHES */}
      <section className="py-20 bg-plum-950/40 border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-500 font-semibold">
                {t('menu.popularBadge')}
              </span>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-ivory-100 mt-1">
                {t('menu.title')}
              </h2>
              <p className="text-ivory-200/70 text-sm font-light mt-1">
                {t('menu.subtitle')}
              </p>
            </div>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gold-500 text-charcoal-950 hover:bg-gold-400 transition-all shadow-md"
            >
              <span>{t('menu.viewFullMenu')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDishes.map((dish) => (
              <DishCard key={dish.id} item={dish} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. AUTHENTIC AMBIENCE GALLERY HIGHLIGHTS */}
      <section className="py-20 bg-charcoal-950 border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-500 font-semibold">
                {t('gallery.badge')}
              </span>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-ivory-100 mt-1">
                {t('gallery.title')}
              </h2>
              <p className="text-ivory-200/70 text-sm font-light mt-1">
                {t('gallery.subtitle')}
              </p>
            </div>

            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-ivory-100 transition-colors group"
            >
              <span>{t('hero.viewGallery')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Gallery Showcase Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative h-48 sm:h-56 rounded-xl overflow-hidden cursor-pointer border border-gold-500/20 hover:border-gold-500/60 transition-all shadow-lg"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className="text-[10px] text-gold-400 font-mono tracking-wider">{photo.category}</span>
                  <p className="text-xs font-serif font-semibold text-ivory-100 line-clamp-1">{photo.title}</p>
                </div>
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-plum-950/80 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GUEST INVITATION & PRIVATE CABIN BANNER */}
      <section className="py-16 bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 border-t border-gold-500/20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-plum-800 border border-gold-500/40 text-gold-400 shadow-md">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-ivory-100">
            Planning a Birthday, Family Gathering, or Special Celebration?
          </h2>

          <p className="text-ivory-200/90 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
            Reserve our private Express Cabins (Cabin 1, 2 or 3) for an unforgettable dining experience with dedicated hospitality and authentic tastes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 transition-all shadow-lg"
            >
              {t('contact.title')}
            </Link>
            <Link
              to="/qr-menu"
              className="px-8 py-3.5 rounded-xl text-sm font-semibold border border-gold-500/50 text-gold-400 hover:bg-plum-800 transition-all"
            >
              {t('hero.tableOrder')}
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <GalleryLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}
