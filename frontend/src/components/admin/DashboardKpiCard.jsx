import React from 'react';

/**
 * Standardized KPI stat card for Admin Dashboard
 */
export default function DashboardKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default', // 'default' | 'primary' | 'success' | 'warning'
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-lavender-200 shadow-soft animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-lavender-200 rounded w-24" />
          <div className="w-9 h-9 rounded-xl bg-lavender-100" />
        </div>
        <div className="h-7 bg-lavender-200 rounded w-32 my-2" />
        <div className="h-2.5 bg-lavender-100 rounded w-20" />
      </div>
    );
  }

  // Primary highlight card (e.g. Total Revenue)
  if (variant === 'primary') {
    return (
      <div className="bg-gradient-to-br from-plum-dark via-plum-royal to-plum-dark text-ivory rounded-2xl p-5 border border-plum-royal/40 shadow-luxury flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2 z-10">
          <span className="text-xs font-semibold text-gold-300 uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold-300">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="z-10 my-1">
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ivory">
            {value}
          </span>
        </div>
        {subtitle && (
          <span className="text-[11px] text-ivory/70 font-light z-10">
            {subtitle}
          </span>
        )}
        {/* Subtle decorative emblem in corner */}
        {Icon && (
          <Icon className="absolute -right-3 -bottom-3 w-20 h-20 text-white/5 pointer-events-none group-hover:scale-110 transition-transform" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-lavender-200 shadow-soft flex flex-col justify-between hover:border-gold/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-body-muted uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-lavender-100 text-plum-royal border border-gold/30 flex items-center justify-center">
            <Icon className="w-4 h-4 text-plum-royal" />
          </div>
        )}
      </div>
      <div className="my-1">
        <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-plum-royal">
          {value}
        </span>
      </div>
      {subtitle && (
        <span className="text-[11px] text-body-muted font-light">
          {subtitle}
        </span>
      )}
    </div>
  );
}
