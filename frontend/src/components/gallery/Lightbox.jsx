import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Lightbox({ 
  photos = [], 
  currentIndex = 0, 
  onClose, 
  onNext, 
  onPrev 
}) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language.startsWith('hi');
  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!currentPhoto) return null;

  const title = isHindi && currentPhoto.titleHi ? currentPhoto.titleHi : currentPhoto.titleEn;
  const desc = isHindi && currentPhoto.descHi ? currentPhoto.descHi : currentPhoto.descEn;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-plum-dark/95 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
    >
      <div 
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-plum-dark rounded-3xl border border-gold/40 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-plum-800 bg-plum-950/60">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold text-plum-dark uppercase tracking-wider">
              {currentPhoto.category}
            </span>
            <span className="text-xs text-ivory/70 font-mono">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(currentPhoto.imageUrl, '_blank')}
              className="p-2 rounded-full text-ivory/80 hover:text-gold hover:bg-plum-800 transition-colors"
              title="Open full resolution"
              aria-label="Open full resolution in new tab"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-ivory/80 hover:text-gold hover:bg-plum-800 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Central Display with Nav Buttons */}
        <div className="relative flex-1 bg-black/50 flex items-center justify-center overflow-hidden p-2 sm:p-4 min-h-[50vh]">
          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-plum-dark/80 text-ivory hover:text-gold hover:bg-plum-royal border border-gold/30 transition-all shadow-lg"
              aria-label="Previous photograph"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <img
            src={currentPhoto.imageUrl}
            alt={title}
            className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-2xl select-none"
          />

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-plum-dark/80 text-ivory hover:text-gold hover:bg-plum-royal border border-gold/30 transition-all shadow-lg"
              aria-label="Next photograph"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Caption & Authenticity Footer */}
        <div className="px-6 py-4 bg-plum-950 border-t border-plum-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-ivory">
              {title}
            </h3>
            {desc && (
              <p className="text-xs sm:text-sm text-ivory/70 font-light max-w-2xl">
                {desc}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gold-300 font-mono shrink-0">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>The Station Stories Verified Original</span>
          </div>
        </div>
      </div>
    </div>
  );
}
