import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Monitor, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import HealthStatusBanner from '../../components/common/HealthStatusBanner';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      {/* Brand Hero Scaffold */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-charcoal-800 to-charcoal-900 border border-charcoal-700/60 p-8 sm:p-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-600/10 border border-gold-600/30 text-gold-500 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 1 Scaffolding & Verification</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-50 tracking-tight">
          {t('brand.name')}
        </h1>
        <p className="mt-3 text-sm sm:text-lg text-gold-600/90 font-medium tracking-widest uppercase">
          {t('brand.tagline')}
        </p>

        <p className="max-w-2xl mx-auto mt-4 text-xs sm:text-sm text-gray-400 leading-relaxed">
          The official restaurant website, digital QR-menu, point-of-sale billing terminal, and administrative management platform.
        </p>

        {/* Quick Route Shortcuts for Phase 1 Testing */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/pos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-600 hover:bg-gold-500 text-charcoal-950 font-semibold text-xs transition-colors shadow-lg shadow-gold-600/20"
          >
            <Monitor className="w-4 h-4" />
            <span>Launch POS Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-ivory-100 font-medium text-xs border border-charcoal-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            <span>Admin Management</span>
          </Link>
        </div>
      </section>

      {/* Live Backend & Database Health Check Diagnostic */}
      <section>
        <HealthStatusBanner />
      </section>

      {/* Phase 1 Architecture Verification Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-xl bg-charcoal-800/40 border border-charcoal-800">
          <div className="font-semibold text-ivory-100 text-sm mb-1.5 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-gold-500" />
            <span>Customer Web & QR Menu</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Placeholder established at <code className="text-gold-500 font-mono">/</code>. Full responsive customer experience, digital food menu, and authentic photo gallery will be delivered in Phase 3.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-charcoal-800/40 border border-charcoal-800">
          <div className="font-semibold text-ivory-100 text-sm mb-1.5 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gold-500" />
            <span>POS Billing Terminal</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Placeholder established at <code className="text-gold-500 font-mono">/pos</code>. 80mm/58mm thermal receipt printing, fast cart builder, and cash/UPI settlement will be delivered in Phase 4.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-charcoal-800/40 border border-charcoal-800">
          <div className="font-semibold text-ivory-100 text-sm mb-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            <span>Admin Dashboard</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Placeholder established at <code className="text-gold-500 font-mono">/admin</code>. Menu CRUD, revenue analytics, customer CRM, and dynamic tax controls will be delivered in Phase 5.
          </p>
        </div>
      </section>
    </div>
  );
}
