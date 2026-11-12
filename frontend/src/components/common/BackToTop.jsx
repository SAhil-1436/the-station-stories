import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-plum-royal text-ivory border border-gold/40 shadow-luxury hover:bg-plum-dark hover:scale-105 active:scale-95 transition-all duration-200"
      aria-label="Scroll back to top"
      title="Back to Top"
    >
      <ArrowUp className="w-5 h-5 text-gold" />
    </button>
  );
}
