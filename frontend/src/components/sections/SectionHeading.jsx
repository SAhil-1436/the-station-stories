import React from 'react';

export default function SectionHeading({ 
  badge, 
  title, 
  subtitle, 
  align = 'center',
  className = ''
}) {
  const alignmentClass = align === 'left' 
    ? 'text-left items-start' 
    : align === 'right' 
    ? 'text-right items-end' 
    : 'text-center items-center';

  return (
    <div className={`flex flex-col max-w-3xl mx-auto space-y-3 ${alignmentClass} ${className}`}>
      {badge && (
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-lavender-200 text-plum-royal border border-gold/40 shadow-xs">
          {badge}
        </span>
      )}
      {title && (
        <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-plum-royal tracking-tight leading-[1.18]">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-body-muted text-sm sm:text-base font-light leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
