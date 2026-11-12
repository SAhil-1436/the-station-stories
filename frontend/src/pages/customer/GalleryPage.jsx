import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Maximize2, 
  ShieldCheck, 
  Filter, 
  Sparkles 
} from 'lucide-react';
import { getGallery } from '../../services/api';
import GalleryLightbox from '../../components/gallery/GalleryLightbox';

export default function GalleryPage() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  const filters = [
    { key: 'ALL', label: t('gallery.all') },
    { key: 'INTERIOR', label: t('gallery.interior') },
    { key: 'SEATING', label: t('gallery.seating') },
    { key: 'RECEPTION', label: t('gallery.reception') },
    { key: 'LIGHTING', label: t('gallery.lighting') },
    { key: 'DECOR', label: 'Art & Murals' },
  ];

  useEffect(() => {
    setLoading(true);
    getGallery().then(data => {
      setPhotos(data || []);
      setLoading(false);
    });
  }, []);

  const filteredPhotos = photos.filter(p => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DECOR') return p.category === 'DECOR' || p.category === 'BRAND';
    return p.category === activeFilter;
  });

  return (
    <div className="py-12 min-h-screen bg-charcoal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-950 border border-gold-500/30 text-gold-400 text-xs font-mono">
            <Camera className="w-3.5 h-3.5" />
            <span>{t('gallery.authenticWatermark')}</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ivory-100">
            {t('gallery.title')}
          </h1>
          <p className="text-ivory-200/80 text-sm sm:text-base font-light">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeFilter === f.key
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-md'
                  : 'bg-plum-950/70 border border-gold-500/20 text-ivory-200 hover:text-gold-400 hover:bg-plum-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="py-20 text-center text-gold-400 space-y-3">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-gold-500/20 hover:border-gold-500/60 bg-plum-950/60 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="aspect-[4/3] overflow-hidden bg-black/40">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Overlay & Caption */}
                <div className="p-4 bg-gradient-to-t from-plum-950 via-plum-950/90 to-transparent flex items-center justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-plum-900 text-gold-400 border border-gold-500/20">
                      {photo.category}
                    </span>
                    <h3 className="font-serif font-semibold text-sm sm:text-base text-ivory-100 mt-1 line-clamp-1 group-hover:text-gold-400 transition-colors">
                      {photo.title}
                    </h3>
                  </div>

                  <div className="p-2 rounded-xl bg-plum-900/60 text-gold-400 group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-colors shrink-0">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview */}
      {selectedPhoto && (
        <GalleryLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}
