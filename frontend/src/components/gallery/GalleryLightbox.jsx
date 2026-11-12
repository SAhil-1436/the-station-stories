import React, { useEffect } from 'react';
import { X, ZoomIn, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function GalleryLightbox({ photo, onClose }) {
  const { t } = useTranslation();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/95 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-plum-950 rounded-2xl border border-gold-500/30 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-plum-900 bg-plum-900/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-500 text-charcoal-950">
              {photo.category}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gold-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Original Restaurant Photography</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ivory-200 hover:text-gold-400 hover:bg-plum-800 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image Display */}
        <div className="relative flex-1 bg-black/60 flex items-center justify-center overflow-hidden p-2">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Caption Bar */}
        <div className="px-6 py-4 bg-plum-950 border-t border-plum-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-ivory-100">
              {photo.title}
            </h3>
            <p className="text-xs text-gold-500 font-mono">
              {t('gallery.authenticWatermark')}
            </p>
          </div>

          <button
            onClick={() => window.open(photo.imageUrl, '_blank')}
            className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-ivory-100 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
            <span>Open High-Res</span>
          </button>
        </div>
      </div>
    </div>
  );
}
