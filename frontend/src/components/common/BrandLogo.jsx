import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function BrandLogo({ className = '', inverted = false, onClick }) {
  return (
    <Link 
      to="/" 
      onClick={onClick}
      className={`inline-flex items-center gap-2 sm:gap-3.5 group focus:outline-none shrink min-w-0 ${className}`}
      aria-label="The Station Stories – Return to Home"
    >
      {/* Emblem with fork & knife in Royal Plum / Gold */}
      <div 
        className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
          inverted 
            ? 'bg-plum-800 border border-gold/40 group-hover:border-gold' 
            : 'bg-lavender-100 border border-gold/50 group-hover:bg-plum-royal group-hover:border-gold'
        }`}
      >
        <UtensilsCrossed 
          className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors duration-300 ${
            inverted 
              ? 'text-gold-400 group-hover:text-ivory' 
              : 'text-plum-royal group-hover:text-gold-300'
          }`} 
        />
      </div>

      <div className="flex flex-col min-w-0">
        <span 
          className={`font-serif font-bold text-sm sm:text-xl tracking-wide sm:tracking-wider uppercase transition-colors truncate ${
            inverted 
              ? 'text-ivory group-hover:text-gold-300' 
              : 'text-plum-royal group-hover:text-plum-dark'
          }`}
        >
          The Station Stories
        </span>
        <span 
          className={`text-[8px] sm:text-[10px] font-medium tracking-[0.12em] sm:tracking-[0.22em] uppercase truncate ${
            inverted ? 'text-gold-300/80' : 'text-gold-700'
          }`}
        >
          Fast Food & Restaurant
        </span>
      </div>
    </Link>
  );
}
